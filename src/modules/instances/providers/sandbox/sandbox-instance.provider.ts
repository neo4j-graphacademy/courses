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
import { Driver, EagerResult, RoutingControl } from 'neo4j-driver'
import { notify } from '../../../../middleware/bugsnag.middleware'

// Helper function to create fetch options
function createFetchOptions(method: string, token: string, body?: any): RequestInit {
    const options: RequestInit = {
        method,
        headers: {
            authorization: token,
            'Content-Type': 'application/json',
        },
    }

    if (body) {
        options.body = JSON.stringify(body)
    }

    return options
}

// Helper function to handle fetch responses
async function handleFetchResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = new Error(`HTTP error: ${response.status}`)
            ; (error as any).response = {
                status: response.status,
                statusText: response.statusText,
            }
        throw error
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
        return await response.json() as T
    } else {
        return (await response.text()) as unknown as T
    }
}

export class SandboxInstanceProvider implements InstanceProvider {
    // Helper to build the full Sandbox API URL
    private getUrl(path: string): string {
        let base = process.env.SANDBOX_URL || ''
        if (base.endsWith('/')) {
            base = base.slice(0, -1)
        }
        if (!path.startsWith('/')) {
            path = '/' + path
        }
        return base + path
    }

    async getInstances(token: string, user: User, isRetry = false): Promise<Instance[]> {
        if (process.env.SANDBOX_DEV_INSTANCE_HOST) {
            return [devInstance()]
        }

        try {
            const url = this.getUrl(`SandboxGetRunningInstancesForUser${isRetry ? '?is_retry=true' : ''}`)
            const response = await fetch(url, createFetchOptions('GET', token))
            const data = await handleFetchResponse<Instance[]>(response)

            return data.map((row: Instance) => ({
                ...row,
                scheme: `neo4j${IS_PRODUCTION ? '+s' : ''}`,
                username: 'neo4j',
                host: `${row.sandboxHashKey}.neo4jsandbox.com`,
            })) as Instance[]
        } catch (e: any) {
            // Report Error
            await handleSandboxError(token, user, 'SandboxGetRunningInstancesForUser', e)

            // Fail Silently
            return []
        }
    }

    async getInstanceById(token: string, user: User, id: string): Promise<{ instance: Instance; status: string }> {
        const instances = await this.getInstances(token, user)
        const instance = instances.find((row) => row.sandboxHashKey === id)

        try {
            if (!instance) {
                throw new Error(`Instance with ID ${id} not found`)
            }

            const url = this.getUrl(`SandboxGetInstanceByHashKey?sandboxHashKey=${instance?.hashKey}&verifyConnect=true`)
            const response = await fetch(url, createFetchOptions('GET', token))
            const data = await handleFetchResponse<string>(response)

            // Has an IP address
            return {
                instance: {
                    ...instance,
                    ip: data.toString(),
                } as Instance,
                status: INSTANCE_STATUS_READY,
            }
        } catch (e: any) {
            if (e.response) {
                // Not found, either pending or doesn't have an IP
                if (e.response.status === 404) {
                    return {
                        instance: instance as Instance,
                        status: INSTANCE_STATUS_NOT_FOUND,
                    }
                } else if (e.response.status === 417) {
                    return {
                        instance: instance as Instance,
                        status: INSTANCE_STATUS_PENDING,
                    }
                }

                throw await handleSandboxError(token, user, 'SandboxGetInstanceByHashKey', e)
            }

            throw e
        }
    }

    async getInstanceForUseCase(
        token: string,
        user: User,
        usecase: string,
        isRetry = false
    ): Promise<Instance | undefined> {
        if (process.env.SANDBOX_DEV_INSTANCE_HOST) {
            return devInstance()
        }

        const instances = await this.getInstances(token, user, isRetry)

        return instances.find((instance) => instance.usecase === usecase)
    }

    async stopInstance(token: string, user: User, sandboxHashKey: string): Promise<void> {
        try {
            const url = this.getUrl('SandboxStopInstance')
            const response = await fetch(url, createFetchOptions('POST', token, { sandboxHashKey }))
            await handleFetchResponse(response)
        } catch (e: any) {
            throw await handleSandboxError(token, user, 'SandboxStopInstance', e)
        }
    }

    private async sleep(timeout = 500): Promise<void> {
        return new Promise((resolve) => setTimeout(() => resolve(), timeout))
    }

    async createInstance(
        token: string,
        user: User,
        usecase: string,
        vectorOptimized: boolean = false,
        graphAnalyticsPlugin: boolean = false,
        isRetry = false
    ): Promise<Instance> {
        // Prefer existing to avoid 400 errors
        const existing = await this.getInstanceForUseCase(token, user, usecase)

        if (existing) {
            return existing
        }

        try {
            const url = this.getUrl('SandboxRunInstance')
            const response = await fetch(url, createFetchOptions('POST', token, { usecase, cease_emails: true }))
            const data = await handleFetchResponse<Instance>(response)


            // Bug in Sandbox API, on creation the password is hashed.
            // Calling the API again will return the unencrypted password
            if (data.password?.startsWith('AQ')) {
                return (await this.getInstanceForUseCase(token, user, usecase)) as Instance
            }

            return data
        } catch (e: any) {
            if (e.response) {
                if (e.response.status === 400) {
                    await this.sleep()

                    // Retry after a second
                    await this.sleep(2000)

                    const existing = await this.getInstanceForUseCase(token, user, usecase, true)

                    return existing as Instance
                }
                // Sandbox Unauthorized (401) on SandboxRunInstance: Request failed with status code 401 ({"message":"Unauthorized"})
                else if (e.response.status === 401 && isRetry === false) {
                    // Retry after a second
                    await this.sleep(2000)

                    await this.createGraphAcademyUser(token, user)

                    return this.createInstance(token, user, usecase, true)
                }
                // Sandbox Uncategorised Error (503) on SandboxRunInstance: Request failed with status code 503 ({"message":"Service Unavailable"})
                else if (e.response.status === 503 && isRetry === false) {
                    await handleSandboxError(token, user, 'SandboxRunInstance', e)

                    // Retry after a second
                    await this.sleep(2000)

                    return this.createInstance(token, user, usecase, true)
                }
            }

            throw await handleSandboxError(token, user, 'SandboxRunInstance', e)
        }
    }

    async getOrCreateInstanceForUseCase(
        token: string,
        user: User,
        usecase: string,
        vectorOptimized: boolean = false,
        graphAnalyticsPlugin: boolean = false
    ): Promise<Instance> {
        const existing = await this.getInstanceForUseCase(token, user, usecase)

        if (existing) {
            return existing
        }

        return this.createInstance(token, user, usecase, vectorOptimized, graphAnalyticsPlugin)
    }

    private async createGraphAcademyUser(token: string, user: User) {
        try {
            const url = this.getUrl('SandboxCreateGraphAcademyUser')
            const response = await fetch(
                url,
                createFetchOptions('POST', token, {
                    user_id: user.sub,
                    first_name: user.givenName,
                    last_name: user.name, // Use name since familyName doesn't exist
                    company: user.company,
                })
            )
            await handleFetchResponse(response)
        } catch (e: any) {
            throw await handleSandboxError(token, user, 'SandboxCreateGraphAcademyUser', e)
        }
    }

    async saveUserInfo(token: string, user: User, data: UserMetaData): Promise<void> {
        try {
            const url = this.getUrl('SandboxUpdateGraphAcademyUser')
            const response = await fetch(url, createFetchOptions('POST', token, data))
            await handleFetchResponse(response)
        } catch (e: any) {
            throw await handleSandboxError(token, user, 'SandboxUpdateGraphAcademyUser', e)
        }
    }

    async getUserInfo(token: string, user: User): Promise<Partial<User>> {
        try {
            const url = this.getUrl('SandboxGetGraphAcademyUser')
            const response = await fetch(
                url,
                createFetchOptions('POST', token, {
                    user_id: user.sub,
                })
            )
            const data = await handleFetchResponse<Partial<User>>(response)
            return data
        } catch (e: any) {
            throw await handleSandboxError(token, user, 'SandboxGetGraphAcademyUser', e)
        }
    }

    async getAuth0UserInfo(token: string, user: User): Promise<Partial<User>> {
        try {
            const response = await fetch(`${AUTH0_ISSUER_BASE_URL}/tokeninfo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_token: token,
                }),
            })
            const data = await handleFetchResponse<Partial<User>>(response)
            return data
        } catch (e: any) {
            throw await handleSandboxError(token, user, 'Auth0 /tokeninfo', e)
        }
    }

    async executeCypher<T extends Record<string, any> = Record<string, any>>(
        token: string,
        user: User,
        usecase: string,
        cypher: string,
        params: Record<string, any> = {},
        routing: RoutingControl
    ): Promise<EagerResult<T> | undefined> {
        const instance = await this.getInstanceForUseCase(token, user, usecase)

        if (!instance) {
            return
        }

        console.log(`bolt+s://${instance.ip}:${instance.boltPort}`,
            instance.username,
            instance.password)

        let driver: Driver

        try {
            driver = await createDriver(
                `bolt://${instance.ip}:${instance.boltPort}`,
                instance.username,
                instance.password
            )
        }
        catch (e: any) {
            console.log(e)
            return
        }

        try {
            const result = await driver.executeQuery(cypher, params, {
                database: instance.database,
                routing,
            })
            return result as EagerResult<T>
        } catch (e: any) {
            console.log(e)
            notify(e)
        } finally {
            if (driver) {
                await driver.close()
            }
        }
    }
}

interface UserInfo {
    user_id: string
    company: string | undefined
    first_name: string | undefined
    last_name: string | undefined
}

interface UserMetaData extends UserInfo {
    user_metadata: Exclude<UserInfo, 'user_id'>
}
