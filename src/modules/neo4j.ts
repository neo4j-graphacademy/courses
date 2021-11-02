import neo4j, { Driver, Result, Transaction } from 'neo4j-driver'
import { notify } from '../middleware/bugsnag';

let _driver: Driver;

const { NEO4J_DATABASE } = process.env


export async function createDriver(host: string, username: string, password: string): Promise<Driver> {
    const driver = neo4j.driver(host, neo4j.auth.basic(username, password), {
        disableLosslessIntegers: true
    })

    await driver.verifyConnectivity()

    return driver
}

export async function read(query: string, params?: Record<string, any>, database: string | undefined = NEO4J_DATABASE): Promise<Result> {
    const session = _driver.session({ database })

    try {
        const res = await session.readTransaction(tx => {
            return tx.run(query, params)
        })

        await session.close()

        return res
    }
    catch(e: any) {
        await session.close()

        notify(e, event => {
            event.addMetadata('query', {
                // @ts-ignore
                // tslint:disable-next-line no-string-literal
                instance: _driver['_address'],
                query,
                params,
                database,
            })
        })

        throw e
    }
}

export async function write(query: string, params?: Record<string, any>, database: string | undefined = NEO4J_DATABASE): Promise<Result> {
    const session = _driver.session({ database })

    try {
        const res = await session.writeTransaction(tx => {
            return tx.run(query, params)
        })

        await session.close()

        return res
    }
    catch(e: any) {
        await session.close()

        notify(e, event => {
            event.addMetadata('query', {
                // @ts-ignore
                // tslint:disable-next-line no-string-literal
                instance: _driver['_address'],
                query,
                params,
                database,
            })
        })

        throw e
    }
}

export async function writeTransaction<T>(work: (tx: Transaction) => T, database: string | undefined = NEO4J_DATABASE): Promise<T> {
    const session = _driver.session({ database, defaultAccessMode: 'WRITE' })

    const res = await session.writeTransaction<T>(work)

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
