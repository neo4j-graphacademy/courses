import axios, { AxiosResponse } from 'axios'
import { AUTH0_ISSUER_BASE_URL, IS_PRODUCTION } from '../../../constants'
import { devSandbox } from '../../../domain/model/instance.mocks'
import { User } from '../../../domain/model/user'
import { handleSandboxError } from './'
import { Instance } from '../../../domain/model/instance'
import { InstanceProvider } from '../instance-provider.interface'

export const SANDBOX_STATUS_PENDING = 'PENDING'
export const SANDBOX_STATUS_READY = 'READY'
export const SANDBOX_STATUS_NOT_FOUND = 'NOTFOUND'

export class SandboxInstanceProvider implements InstanceProvider {
    private api() {
        const { SANDBOX_URL } = process.env

        return axios.create({
            baseURL: SANDBOX_URL,
        })
    }

    async getSandboxes(token: string, user: User, isRetry = false): Promise<Instance[]> {
        if (process.env.SANDBOX_DEV_INSTANCE_HOST) {
            return [devSandbox()]
        }

        try {
            const res = await this.api().get(
                `SandboxGetRunningInstancesForUser${isRetry ? '?is_retry=true' : ''}`,
                {
                    headers: {
                        authorization: `${token}`
                    },
                }
            )

            return res.data.map((row: Sandbox) => ({
                ...row,
                scheme: `neo4j${IS_PRODUCTION ? '+s' : ''}`,
                username: 'neo4j',
                host: `${row.sandboxHashKey}.neo4jsandbox.com`,
            })) as Sandbox[]
        }
        catch (e: any) {
            // Report Error
            await handleSandboxError(token, user, 'SandboxGetRunningInstancesForUser', e)

            // Fail Silently
            return []
        }
    }

    async getSandboxByHashKey(token: string, user: User, sandboxHashKey: string): Promise<{ sandbox: Instance; status: string }> {
        const sandboxes = await this.getSandboxes(token, user)
        const sandbox = sandboxes.find(row => row.sandboxHashKey === sandboxHashKey)

        try {
            const res: AxiosResponse<string> = await this.api().get(`SandboxGetInstanceByHashKey?sandboxHashKey=${sandboxHashKey}&verifyConnect=true`, {
                headers: {
                    authorization: `${token}`
                },
            })

            // Has an IP address
            return {
                sandbox: {
                    ...sandbox,
                    ip: res.data.toString(),
                } as Instance,
                status: SANDBOX_STATUS_READY,
            }
        }
        catch (e: any) {
            // Not found, either pending or doesn't have an IP
            const response = e.response as AxiosResponse<string>

            if (response.status === 404) {
                return {
                    sandbox: sandbox as Instance,
                    status: SANDBOX_STATUS_NOT_FOUND,
                }
            } else if (response.status === 417) {
                return {
                    sandbox: sandbox as Sandbox,
                    status: SANDBOX_STATUS_PENDING,
                }
            }

            throw handleSandboxError(token, user, 'SandboxGetInstanceByHashKey', e)
        }
    }

    async getSandboxForUseCase(token: string, user: User, usecase: string, isRetry = false): Promise<Sandbox | undefined> {
        if (process.env.SANDBOX_DEV_INSTANCE_HOST) {
            return devSandbox()
        }

        const sandboxes = await this.getSandboxes(token, user, isRetry)

        return sandboxes.find(sandbox => sandbox.usecase === usecase)
    }

    async stopSandbox(token: string, user: User, sandboxHashKey: string): Promise<void> {
        try {
            await this.api().post(
                `SandboxStopInstance`,
                { sandboxHashKey, },
                {
                    headers: {
                        authorization: `${token}`
                    },
                }
            )
        }
        catch (e: any) {
            throw handleSandboxError(token, user, 'SandboxStopInstance', e)
        }
    }

    private async sleep(timeout = 500): Promise<void> {
        return new Promise(resolve => setTimeout(() => resolve(), timeout))
    }

    async createSandbox(token: string, user: User, usecase: string, isRetry = false): Promise<Sandbox> {
        // Prefer existing to avoid 400 errors
        const existing = await this.getSandboxForUseCase(token, user, usecase, isRetry)

        if (existing) {
            return existing
        }

        try {
            const res = await this.api().post(
                `SandboxRunInstance`,
                { usecase, cease_emails: true },
                {
                    headers: {
                        authorization: `${token}`
                    },
                }
            )

            // Bug in Sandbox API, on creation the password is hashed.
            // Calling the API again will return the unencrypted password
            const data = res.data as Sandbox

            if (data.password?.startsWith('AQ')) {
                return await this.getSandboxForUseCase(token, user, usecase) as Sandbox
            }

            return data
        }
        catch (e: any) {
            if (e.response) {
                const response = e.response as AxiosResponse<{ errorString: string }>

                if (response.status === 400) {
                    await this.sleep()

                    // Retry after a second
                    await this.sleep(2000)

                    const existing = await this.getSandboxForUseCase(token, user, usecase, true)

                    return existing as Sandbox
                }
                // Sandbox Unauthorized (401) on SandboxRunInstance: Request failed with status code 401 ({"message":"Unauthorized"})
                else if (response.status === 401 && isRetry === false) {
                    // Retry after a second
                    await this.sleep(2000)

                    await this.createGraphAcademyUser(token, user)

                    return this.createSandbox(token, user, usecase, true)
                }
                // Sandbox Uncategorised Error (503) on SandboxRunInstance: Request failed with status code 503 ({"message":"Service Unavailable"})
                else if (response.status === 503 && isRetry === false) {
                    await handleSandboxError(token, user, 'SandboxRunInstance', e)

                    // Retry after a second
                    await this.sleep(2000)

                    return this.createSandbox(token, user, usecase, true)
                }
            }

            throw handleSandboxError(token, user, 'SandboxRunInstance', e)
        }
    }

    async getOrCreateSandboxForUseCase(token: string, user: User, usecase: string): Promise<Sandbox> {
        let sandbox = await this.getSandboxForUseCase(token, user, usecase)

        if (!sandbox) {
            sandbox = await this.createSandbox(token, user, usecase)
        }

        return sandbox
    }

    private async createGraphAcademyUser(token: string, user: User) {
        try {
            await this.api().post(
                `SandboxCreateGraphAcademyUser`,
                {},
                {
                    headers: {
                        authorization: `${token}`
                    },
                }
            )
        }
        catch (e: any) {
            throw handleSandboxError(token, user, 'SandboxCreateGraphAcademyUser', e)
        }
    }

    async saveUserInfo(token: string, user: User, data: UserMetaData): Promise<void> {
        try {
            await this.createGraphAcademyUser(token, user)

            await this.api().post(
                `SandboxSaveUserInfo`,
                data,
                {
                    headers: {
                        authorization: `${token}`
                    },
                }
            )
        }
        catch (e: any) {
            throw handleSandboxError(token, user, 'SandboxSaveUserInfo', e)
        }
    }

    async getAuth0UserInfo(token: string, user: User): Promise<Partial<User>> {
        try {
            const res = await axios.post(`${AUTH0_ISSUER_BASE_URL}/tokeninfo`, {
                id_token: token
            })

            return res.data as Partial<User>
        }
        catch (e) {
            throw handleSandboxError(token, user, 'tokeninfo', e)
        }
    }

    async getUserInfo(token: string, user: User): Promise<Partial<User>> {
        try {
            const res = await this.api().get(`SandboxGetUserInfo`, {
                headers: {
                    authorization: `${token}`
                },
            })

            const [profile] = res.data

            return profile as Partial<User>
        }
        catch (e) {
            throw handleSandboxError(token, user, 'SandboxGetUserInfo', e)
        }
    }
}

interface UserInfo {
    user_id: string;
    company: string | undefined;
    first_name: string | undefined;
    last_name: string | undefined;
}

interface UserMetaData extends UserInfo {
    user_metadata: Exclude<UserInfo, 'user_id'>
}
