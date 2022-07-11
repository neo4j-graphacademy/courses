import axios, { AxiosError, AxiosInstance } from 'axios'
import { devSandbox } from '../../domain/model/sandbox.mocks'
import { User } from '../../domain/model/user'
import { notify } from '../../middleware/bugsnag.middleware'
import { isVerified } from '../jwt'
import { handleSandboxError } from './handle-sandbox-error'

export type Neo4jScheme = 'neo4j' | 'neo4j+s' | 'neo4j+scc' | 'bolt' | 'bolt+s' | 'bolt+scc'

export interface Sandbox {
    sandboxId: string;
    sandboxHashKey: string;
    usecase: string;

    scheme: Neo4jScheme;
    ip: string;
    host: string;
    boltPort: string;
    username: string;
    password: string;
    expires: number;

    [key: string]: any;
}

let api: AxiosInstance

export function sandboxApi() {
    const { SANDBOX_URL } = process.env

    if ( api === undefined ) {
        api = axios.create({
            baseURL: SANDBOX_URL,
        })
    }

    return api
}


export async function getAuth0UserInfo(token: string):  Promise<Partial<User>> {
    try {
        const res = await axios.post(`${process.env.AUTH0_ISSUER_BASE_URL}/tokeninfo`, {
            id_token: token
        })

        return res.data
    }
    catch(e) {
        throw handleSandboxError(token, 'tokeninfo', e)
    }
}

export async function getUserInfo(token: string): Promise<Partial<User>> {
    try {
        const res = await sandboxApi().get(`SandboxGetUserInfo`, {
            headers: {
                authorization: `${token}`
            },
        })

        const [ user ] = res.data

        return user as Partial<User>
    }
    catch(e) {
        throw handleSandboxError(token, 'SandboxGetUserInfo', e)
    }
}


export async function getSandboxes(token: string): Promise<Sandbox[]> {
    if (!isVerified(token)) {
        return []
    }

    if ( process.env.SANDBOX_DEV_INSTANCE_HOST ) {
        return [ devSandbox() ]
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
            scheme: 'bolt+s',
            username: 'neo4j',
            host: `${row.sandboxHashKey}.neo4jsandbox.com`,
        }))
    }
    catch (e: any) {
        // Report Error
        handleSandboxError(token, 'SandboxGetRunningInstancesForUser', e)

        // Fail Silently
        return []
    }
}

export async function getSandboxForUseCase(token: string, usecase: string): Promise<Sandbox | undefined> {
    if (!isVerified(token)) {
        return undefined
    }

    if ( process.env.SANDBOX_DEV_INSTANCE_HOST ) {
        return devSandbox()
    }

    const sandboxes = await getSandboxes(token)

    return sandboxes.find(sandbox => sandbox.usecase === usecase)
}

export async function createSandbox(token: string, usecase: string): Promise<Sandbox> {
    // Prefer existing to avoid 400 errors
    const existing = await getSandboxForUseCase(token, usecase)

    if ( existing ) {
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

        return res.data
    }
    catch (e: any) {
        throw handleSandboxError(token, 'SandboxGetRunningInstancesForUser', e)
    }
}

export async function stopSandbox(token: string, sandboxHashKey: string) {
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

        return res.data
    }
    catch (e: any) {
        throw handleSandboxError(token, 'SandboxGetRunningInstancesForUser', e)
    }
}
