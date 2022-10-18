import neo4j, { Driver, QueryResult } from 'neo4j-driver'
import { notify } from '../middleware/bugsnag.middleware';

let _driver: Driver;

const { NEO4J_DATABASE } = process.env

export async function createDriver(host: string, username: string, password: string): Promise<Driver> {
    const driver = neo4j.driver(host, neo4j.auth.basic(username, password), {
        disableLosslessIntegers: true
    })

    await driver.verifyConnectivity()

    return driver
}

export async function read(query: string, params?: Record<string, any>, database: string | undefined = NEO4J_DATABASE): Promise<QueryResult> {
    const session = _driver.session({ database })

    try {
        const res = await session.executeRead(tx => tx.run(query, params))

        await session.close()

        return res
    }
    catch (e: any) {
        await session.close()

        notify(e, event => {
            event.addMetadata('query', {
                instance: (_driver as any)['_address'],
                query,
                params,
                database,
            })
        })

        throw e
    }
}

export async function write(query: string, params?: Record<string, any>, database: string | undefined = NEO4J_DATABASE): Promise<QueryResult> {
    const session = _driver.session({ database })

    try {
        const res = await session.executeWrite(tx => tx.run(query, params))

        await session.close()

        return res
    }
    catch (e: any) {
        await session.close()

        notify(e, event => {
            event.addMetadata('query', {
                instance: (_driver as any)['_address'],
                query,
                params,
                database,
            })
        })

        throw e
    }
}

export async function writeTransaction(work, database: string | undefined = NEO4J_DATABASE): Promise<any> {
    const session = _driver.session({ database, defaultAccessMode: 'WRITE' })

    const res = await session.executeWrite(work)

    await session.close()

    return res
}

export async function close() {
    return _driver && _driver.close()
}

export default async function initNeo4j(host: string, username: string, password: string): Promise<Driver> {
    _driver = await createDriver(host, username, password)

    return _driver
}

export function getDriver(): Driver {
    return _driver;
}
