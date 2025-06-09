import axios, { AxiosResponse } from 'axios'
import { AUTH0_ISSUER_BASE_URL, IS_PRODUCTION } from '../../../constants'
import { devInstance } from '../../../domain/model/instance.mocks'
import { User } from '../../../domain/model/user'
import { handleSandboxError } from '../providers/sandbox/handle-sandbox-error'
import { Instance } from '../../../domain/model/instance'
import { InstanceProvider } from '../instance-provider.interface'

export const SANDBOX_STATUS_PENDING = 'PENDING'
export const SANDBOX_STATUS_READY = 'READY'
export const SANDBOX_STATUS_NOT_FOUND = 'NOTFOUND'

export class InstanceInstanceProvider implements InstanceProvider {
    private api() {
        const { SANDBOX_URL } = process.env

        return axios.create({
            baseURL: SANDBOX_URL,
        })
    }

    async getInstances(token: string, user: User, isRetry = false): Promise<Instance[]> {
        if (process.env.SANDBOX_DEV_INSTANCE_HOST) {
            return [devInstance()]
        }

        try {
            const res = await this.api().get(
                `InstanceGetRunningInstancesForUser${isRetry ? '?is_retry=true' : ''}`,
                {
                    headers: {
                        authorization: `${token}`
                    },
                }
            )

            return res.data.map((row: Instance) => ({
                ...row,
                scheme: `neo4j${IS_PRODUCTION ? '+s' : ''}`,
                username: 'neo4j',
                host: `${row.sandboxHashKey}.neo4jsandbox.com`,
            })) as Instance[]
        }
        catch (e: any) {
            // Report Error
            await handleSandboxError(token, user, 'InstanceGetRunningInstancesForUser', e)

            // Fail Silently
            return []
        }
    }

    async getInstanceById(token: string, user: User, hash: string): Promise<{ instance: Instance | undefined; status: string; }> {
        return this.getInstanceByHashKey(token, user, hash)
    }

    async getInstanceByHashKey(token: string, user: User, sandboxHashKey: string): Promise<{ instance: Instance; status: string }> {
        const sandboxes = await this.getInstances(token, user)
        const sandbox = sandboxes.find(row => row.sandboxHashKey === sandboxHashKey)

        try {
            const res: AxiosResponse<string> = await this.api().get(`InstanceGetInstanceByHashKey?sandboxHashKey=${sandboxHashKey}&verifyConnect=true`, {
                headers: {
                    authorization: `${token}`
                },
            })

            // Has an IP address
            return {
                instance: {
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
                    instance: sandbox as Instance,
                    status: SANDBOX_STATUS_NOT_FOUND,
                }
            } else if (response.status === 417) {
                return {
                    instance: sandbox as Instance,
                    status: SANDBOX_STATUS_PENDING,
                }
            }

            throw handleSandboxError(token, user, 'InstanceGetInstanceByHashKey', e)
        }
    }

    async getInstanceForUseCase(token: string, user: User, usecase: string, isRetry = false): Promise<Instance | undefined> {
        if (process.env.SANDBOX_DEV_INSTANCE_HOST) {
            return devInstance()
        }

        const sandboxes = await this.getInstances(token, user, isRetry)

        return sandboxes.find(sandbox => sandbox.usecase === usecase)
    }

    async stopInstance(token: string, user: User, sandboxHashKey: string): Promise<void> {
        try {
            await this.api().post(
                `InstanceStopInstance`,
                { sandboxHashKey, },
                {
                    headers: {
                        authorization: `${token}`
                    },
                }
            )
        }
        catch (e: any) {
            throw handleSandboxError(token, user, 'InstanceStopInstance', e)
        }
    }

    private async sleep(timeout = 500): Promise<void> {
        return new Promise(resolve => setTimeout(() => resolve(), timeout))
    }

    async createInstance(token: string, user: User, usecase: string, isRetry = false): Promise<Instance> {
        // Prefer existing to avoid 400 errors
        const existing = await this.getInstanceForUseCase(token, user, usecase, isRetry)

        if (existing) {
            return existing
        }

        try {
            const res = await this.api().post(
                `InstanceRunInstance`,
                { usecase, cease_emails: true },
                {
                    headers: {
                        authorization: `${token}`
                    },
                }
            )

            // Bug in Instance API, on creation the password is hashed.
            // Calling the API again will return the unencrypted password
            const data = res.data as Instance

            if (data.password?.startsWith('AQ')) {
                return await this.getInstanceForUseCase(token, user, usecase) as Instance
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

                    const existing = await this.getInstanceForUseCase(token, user, usecase, true)

                    return existing as Instance
                }
                // Instance Unauthorized (401) on InstanceRunInstance: Request failed with status code 401 ({"message":"Unauthorized"})
                else if (response.status === 401 && isRetry === false) {
                    // Retry after a second
                    await this.sleep(2000)

                    await this.createGraphAcademyUser(token, user)

                    return this.createInstance(token, user, usecase, true)
                }
                // Instance Uncategorised Error (503) on InstanceRunInstance: Request failed with status code 503 ({"message":"Service Unavailable"})
                else if (response.status === 503 && isRetry === false) {
                    await handleSandboxError(token, user, 'InstanceRunInstance', e)

                    // Retry after a second
                    await this.sleep(2000)

                    return this.createInstance(token, user, usecase, true)
                }
            }

            throw handleSandboxError(token, user, 'InstanceRunInstance', e)
        }
    }

    async getOrCreateInstanceForUseCase(token: string, user: User, usecase: string): Promise<Instance> {
        let sandbox = await this.getInstanceForUseCase(token, user, usecase)

        if (!sandbox) {
            sandbox = await this.createInstance(token, user, usecase)
        }

        return sandbox
    }

    private async createGraphAcademyUser(token: string, user: User) {
        try {
            await this.api().post(
                `InstanceCreateGraphAcademyUser`,
                {},
                {
                    headers: {
                        authorization: `${token}`
                    },
                }
            )
        }
        catch (e: any) {
            throw handleSandboxError(token, user, 'InstanceCreateGraphAcademyUser', e)
        }
    }

    async saveUserInfo(token: string, user: User, data: UserMetaData): Promise<void> {
        try {
            await this.createGraphAcademyUser(token, user)

            await this.api().post(
                `InstanceSaveUserInfo`,
                data,
                {
                    headers: {
                        authorization: `${token}`
                    },
                }
            )
        }
        catch (e: any) {
            throw handleSandboxError(token, user, 'InstanceSaveUserInfo', e)
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
            const res = await this.api().get(`InstanceGetUserInfo`, {
                headers: {
                    authorization: `${token}`
                },
            })

            const [profile] = res.data

            return profile as Partial<User>
        }
        catch (e) {
            throw handleSandboxError(token, user, 'InstanceGetUserInfo', e)
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
