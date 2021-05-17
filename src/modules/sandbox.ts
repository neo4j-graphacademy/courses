import axios from 'axios'
import { devSandbox } from '../domain/model/sandbox.mocks'

export type Neo4jScheme = 'neo4j' | 'neo4j+s' | 'neo4j+scc' | 'bolt' | 'bolt+s' | 'bolt+scc'

export interface Sandbox {
    sandboxId: string;
    sandboxHashKey: string;
    usecase: string;

    scheme: Neo4jScheme;
    host: string;
    boltPort: string;
    username: string;
    password: string;
    expires: number;

    [key: string]: any;
}

const { SANDBOX_URL } = process.env

export async function getSandboxes(token: string): Promise<Sandbox[]> {
    if ( process.env.SANDBOX_DEV_INSTANCE_HOST ) {
        return [ devSandbox() ]
    }

    try {
        const res = await axios.get(
            `${SANDBOX_URL}SandboxGetRunningInstancesForUser`,
            {
                headers: {
                    authorization: `${token}`
                },
            }
        )

        console.log(res.data);


        return res.data.map((row: Sandbox) => ({
            ...row,
            scheme: 'bolt+s',
            host: `${row.sandboxHashKey}.neo4jsandbox.com`,
        }))
    }
    catch (e) {
        console.log(e.data);

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
    const res = await axios.post(
        `${SANDBOX_URL}SandboxRunInstance`,
        { usecase, },
        {
            headers: {
                authorization: `${token}`
            },
        }
    )

    return res.data
}