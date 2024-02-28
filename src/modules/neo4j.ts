import neo4j, { Driver, QueryResult } from 'neo4j-driver'
import { notify } from '../middleware/bugsnag.middleware';
import Neo4jError from '../errors/neo4j.error';

let _driver: Driver;

const { NEO4J_DATABASE } = process.env

export async function createDriver(host: string, username: string, password: string, verifyConnectivity = true): Promise<Driver> {
    const driver = neo4j.driver(host, neo4j.auth.basic(username, password), {
        disableLosslessIntegers: true
    })

    if (verifyConnectivity) {
        await driver.verifyConnectivity()
    }

    return driver
}

export async function read<T extends Record<string, any> = Record<string, any>>(query: string, params?: Record<string, any>, database: string | undefined = NEO4J_DATABASE): Promise<QueryResult<T>> {
    const session = _driver.session({ database })

    try {
        const res = await session.executeRead(tx => tx.run<T>(query, params))

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

        throw new Neo4jError(e.message, query, params, database, e)
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

        throw new Neo4jError(e.message, query, params, database, e)
    }
}

export async function readTransaction<T = any>(work, database: string | undefined = NEO4J_DATABASE): Promise<T> {
    const session = _driver.session({ database, defaultAccessMode: 'WRITE' })

    const res = await session.executeRead(work)

    await session.close()

    return res as T
}

export async function writeTransaction<T = any>(work, database: string | undefined = NEO4J_DATABASE): Promise<T> {
    const session = _driver.session({ database, defaultAccessMode: 'WRITE' })

    const res = await session.executeWrite(work)

    await session.close()

    return res as T
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
