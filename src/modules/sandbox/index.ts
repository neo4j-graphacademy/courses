import axios, { AxiosResponse } from 'axios'
import { AUTH0_ISSUER_BASE_URL, IS_PRODUCTION } from '../../constants'
import { devSandbox } from '../../domain/model/sandbox.mocks'
import { User } from '../../domain/model/user'
import { handleSandboxError } from './handle-sandbox-error'
import { Sandbox } from '../../domain/model/sandbox'

export type Neo4jScheme = 'neo4j' | 'neo4j+s' | 'neo4j+scc' | 'bolt' | 'bolt+s' | 'bolt+scc'


export function sandboxApi() {
    const { SANDBOX_URL } = process.env

    return axios.create({
        baseURL: SANDBOX_URL,
    })
}


export async function getAuth0UserInfo(token: string, user: User): Promise<Partial<User>> {
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

export async function getUserInfo(token: string, user: User): Promise<Partial<User>> {
    try {
        const res = await sandboxApi().get(`SandboxGetUserInfo`, {
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


export async function getSandboxes(token: string, user: User): Promise<Sandbox[]> {
    // if (!isVerified(token)) {
    //     return []
    // }

    if (process.env.SANDBOX_DEV_INSTANCE_HOST) {
        return [devSandbox()]
    }

    try {
        const res = await sandboxApi().get(
            `SandboxGetRunningInstancesForUser`,
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
        handleSandboxError(token, user, 'SandboxGetRunningInstancesForUser', e)

        // Fail Silently
        return []
    }
}


export const SANDBOX_STATUS_PENDING = 'PENDING'
export const SANDBOX_STATUS_READY = 'READY'
export const SANDBOX_STATUS_NOT_FOUND = 'NOTFOUND'

interface getSandboxByHashKeyResponse {
    sandboxHashKey: string;
    status: typeof SANDBOX_STATUS_PENDING | typeof SANDBOX_STATUS_READY | typeof SANDBOX_STATUS_NOT_FOUND;
    sandbox: Sandbox | undefined;
}

export async function getSandboxByHashKey(token: string, user: User, sandboxHashKey: string): Promise<getSandboxByHashKeyResponse> {
    const sandboxes = await getSandboxes(token, user)
    const sandbox = sandboxes.find(row => row.sandboxHashKey === sandboxHashKey)

    try {
        const res: AxiosResponse<string> = await sandboxApi().get(`getSandboxByHashKey?sandboxHashKey=${sandboxHashKey}&verifyConnect=true`, {
            headers: {
                authorization: `${token}`
            },
        })

        // Has an IP address
        return {
            sandbox: {
                ...sandbox,
                ip: res.data.toString(),
            } as Sandbox,
            sandboxHashKey,
            status: SANDBOX_STATUS_READY,
        }
    }
    catch (e: any) {
        // Not found, either pending or doesn't have an IP
        const response = e.response as AxiosResponse<string>

        if (response.status === 404) {
            return {
                sandboxHashKey,
                sandbox,
                status: response.data.includes('no ip') ? SANDBOX_STATUS_PENDING : SANDBOX_STATUS_NOT_FOUND,
            }
        }

        throw handleSandboxError(token, user, 'getSandboxByHashKey', e)
    }
}

export async function getOrCreateSandboxForUseCase(token: string, user: User, usecase: string): Promise<Sandbox> {
    let sandbox = await getSandboxForUseCase(token, user, usecase)

    if (!sandbox) {
        sandbox = await createSandbox(token, user, usecase)
    }

    return sandbox
}

export async function getSandboxForUseCase(token: string, user: User, usecase: string): Promise<Sandbox | undefined> {
    if (process.env.SANDBOX_DEV_INSTANCE_HOST) {
        return devSandbox()
    }

    const sandboxes = await getSandboxes(token, user)

    return sandboxes.find(sandbox => sandbox.usecase === usecase)
}

export async function createSandbox(token: string, user: User, usecase: string, isRetry = false): Promise<Sandbox> {
    // Prefer existing to avoid 400 errors
    const existing = await getSandboxForUseCase(token, user, usecase)

    if (existing) {
        return existing
    }

    try {
        const res = await sandboxApi().post(
            `SandboxRunInstance`,
            { usecase, },
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
            return await getSandboxForUseCase(token, user, usecase) as Sandbox
        }

        return data
    }
    catch (e: any) {
        if (e.response) {
            const response = e.response as AxiosResponse<{ errorString: string }>

            if (response.status === 400 && response.data.errorString.includes('already exists')) {
                await sleep()

                const existing = await getSandboxForUseCase(token, user, usecase)

                return existing as Sandbox
            }
            // Sandbox Unauthorized (401) on SandboxRunInstance: Request failed with status code 401 ({"message":"Unauthorized"})
            else if (response.status === 401 && isRetry === false) {
                await createGraphAcademyUser(token, user)

                return createSandbox(token, user, usecase, true)
            }
            // Sandbox Uncategorised Error (503) on SandboxRunInstance: Request failed with status code 503 ({"message":"Service Unavailable"})
            else if (response.status === 503 && isRetry === false) {
                handleSandboxError(token, user, 'SandboxRunInstance', e)

                // Retry after a second
                await sleep(1000)

                return createSandbox(token, user, usecase, true)
            }
        }

        throw handleSandboxError(token, user, 'SandboxRunInstance', e)
    }
}

function sleep(timeout = 500): Promise<void> {
    return new Promise(resolve => setTimeout(() => resolve(), timeout))
}

export async function stopSandbox(token: string, user: User, sandboxHashKey: string): Promise<Sandbox> {
    try {
        const res = await sandboxApi().post(
            `SandboxStopInstance`,
            { sandboxHashKey, },
            {
                headers: {
                    authorization: `${token}`
                },
            }
        )

        return res.data as Sandbox
    }
    catch (e: any) {
        throw handleSandboxError(token, user, 'SandboxStopInstance', e)
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

export async function saveUserInfo(token: string, user: User, data: UserMetaData): Promise<void> {
    try {
        await createGraphAcademyUser(token, user)

        await sandboxApi().post(
            `SandboxSaveUserInfo`,
            { user_metadata: data },
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

export async function createGraphAcademyUser(token: string, user: User) {
    try {
        await sandboxApi().post(
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
