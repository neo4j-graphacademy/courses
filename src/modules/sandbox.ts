import axios, { AxiosError } from 'axios'
import { devSandbox } from '../domain/model/sandbox.mocks'
import { notify } from '../middleware/bugsnag'

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

const { SANDBOX_URL } = process.env

const api = axios.create({
    baseURL: SANDBOX_URL,
})


export async function getSandboxes(token: string): Promise<Sandbox[]> {
    if ( process.env.SANDBOX_DEV_INSTANCE_HOST ) {
        return [ devSandbox() ]
    }

    try {
        const res = await api.get(
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
        notify(e, event => {
            event.addMetadata('request', e.request)
            event.addMetadata('response', e.response)
        })

        return []
    }
}

export async function getSandboxForUseCase(token: string, usecase: string): Promise<Sandbox | undefined> {
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

    const res = await api.post(
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
