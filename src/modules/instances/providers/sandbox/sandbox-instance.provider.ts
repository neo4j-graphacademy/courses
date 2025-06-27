import axios, { AxiosResponse } from 'axios'
import { AUTH0_ISSUER_BASE_URL, IS_PRODUCTION } from '../../../../constants'
import { devInstance } from '../../../../domain/model/instance.mocks'
import { User } from '../../../../domain/model/user'
import { handleSandboxError } from './handle-sandbox-error'
import { Instance } from '../../../../domain/model/instance'
import { InstanceProvider } from '../../instance-provider.interface'
import { INSTANCE_STATUS_PENDING } from '../..'
import { INSTANCE_STATUS_NOT_FOUND } from '../..'
import { INSTANCE_STATUS_READY } from '../..'
import { createDriver } from '../../../neo4j'
import { EagerResult, RoutingControl } from 'neo4j-driver'

export class SandboxInstanceProvider implements InstanceProvider {
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
                `SandboxGetRunningInstancesForUser${isRetry ? '?is_retry=true' : ''}`,
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
            await handleSandboxError(token, user, 'SandboxGetRunningInstancesForUser', e)

            // Fail Silently
            return []
        }
    }

    async getInstanceById(token: string, user: User, id: string): Promise<{ instance: Instance; status: string }> {
        const instances = await this.getInstances(token, user)
        const instance = instances.find(row => row.id === id)

        try {
            if (!instance) {
                throw new Error(`Instance with ID ${id} not found`)
            }

            const res: AxiosResponse<string> = await this.api().get(`SandboxGetInstanceByHashKey?sandboxHashKey=${instance?.hashKey}&verifyConnect=true`, {
                headers: {
                    authorization: `${token}`
                },
            })

            // Has an IP address
            return {
                instance: {
                    ...instance,
                    ip: res.data.toString(),
                } as Instance,
                status: INSTANCE_STATUS_READY,
            }
        }
        catch (e: any) {
            if (e.response) {
                // Not found, either pending or doesn't have an IP
                const response = e.response as AxiosResponse<string>

                if (response.status === 404) {
                    return {
                        instance: instance as Instance,
                        status: INSTANCE_STATUS_NOT_FOUND,
                    }
                } else if (response.status === 417) {
                    return {
                        instance: instance as Instance,
                        status: INSTANCE_STATUS_PENDING,
                    }
                }

                throw handleSandboxError(token, user, 'SandboxGetInstanceByHashKey', e)
            }

            throw e
        }
    }

    async getInstanceForUseCase(token: string, user: User, usecase: string, isRetry = false): Promise<Instance | undefined> {
        if (process.env.SANDBOX_DEV_INSTANCE_HOST) {
            return devInstance()
        }

        const instances = await this.getInstances(token, user, isRetry)

        return instances.find(instance => instance.usecase === usecase)
    }

    async stopInstance(token: string, user: User, sandboxHashKey: string): Promise<void> {
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

    async createInstance(token: string, user: User, usecase: string, vectorOptimized: boolean = false, graphAnalyticsPlugin: boolean = false, isRetry = false): Promise<Instance> {
        // Prefer existing to avoid 400 errors
        const existing = await this.getInstanceForUseCase(token, user, usecase)

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
                // Sandbox Unauthorized (401) on SandboxRunInstance: Request failed with status code 401 ({"message":"Unauthorized"})
                else if (response.status === 401 && isRetry === false) {
                    // Retry after a second
                    await this.sleep(2000)

                    await this.createGraphAcademyUser(token, user)

                    return this.createInstance(token, user, usecase, true)
                }
                // Sandbox Uncategorised Error (503) on SandboxRunInstance: Request failed with status code 503 ({"message":"Service Unavailable"})
                else if (response.status === 503 && isRetry === false) {
                    await handleSandboxError(token, user, 'SandboxRunInstance', e)

                    // Retry after a second
                    await this.sleep(2000)

                    return this.createInstance(token, user, usecase, true)
                }
            }

            throw handleSandboxError(token, user, 'SandboxRunInstance', e)
        }
    }

    async getOrCreateInstanceForUseCase(token: string, user: User, usecase: string, vectorOptimized: boolean = false, graphAnalyticsPlugin: boolean = false): Promise<Instance> {
        let instance = await this.getInstanceForUseCase(token, user, usecase)

        if (!instance) {
            instance = await this.createInstance(token, user, usecase, vectorOptimized, graphAnalyticsPlugin)
        }

        return instance
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

    async executeCypher<T = Record<string, any>>(token: string, user: User, usecase: string, cypher: string, params: Record<string, any> = {}, routing: RoutingControl): Promise<EagerResult<T> | undefined> {
        try {
            const instance = await this.getInstanceForUseCase(token, user, usecase)

            if (instance !== undefined) {
                // Connect to instance
                const driver = await createDriver(
                    `bolt://${instance.ip}:${instance.boltPort}`,
                    instance.username,
                    instance.password,
                    true
                )

                let result: EagerResult<T> | undefined;

                const parts = cypher.split(';\n')
                    .filter(e => e.trim() !== '')

                for (const part of parts) {
                    result = await driver.executeQuery<EagerResult<T>>(part, params, {
                        database: instance.database || 'neo4j',
                        routing,
                    })
                }

                await driver.close()

                return result;
            }

            throw new Error(`Could not connect to aura instance for usecase: ${usecase}`)
        }
        catch (e) {
            void handleSandboxError(token, user, 'SandboxResetDatabase', e)
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
