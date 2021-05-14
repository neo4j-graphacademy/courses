import dotenv from 'dotenv'
import neo4j, { Transaction } from 'neo4j-driver'

dotenv.config()

const {
    NEO4J_HOST,
    NEO4J_USERNAME,
    NEO4J_PASSWORD,
} = process.env


const driver = createDriver(<string> NEO4J_HOST, <string> NEO4J_USERNAME, <string> NEO4J_PASSWORD)

export function createDriver(host: string, username: string, password: string) {
    return neo4j.driver(host, neo4j.auth.basic(username, password), {
        disableLosslessIntegers: true
    })
}

export async function read(query: string, params?: Record<string, any>, database?: string) {
    const session = driver.session({ database })

    const res = await session.readTransaction(tx => {
        return tx.run(query, params)
    })

    await session.close()

    return res
}

export async function write(query: string, params?: Record<string, any>, database?: string) {
    const session = driver.session({ database })

    const res = await session.writeTransaction(tx => {
        return tx.run(query, params)
    })

    await session.close()

    return res
}

export async function writeTransaction(work: (tx: Transaction) => void, database?: string) {
    const session = driver.session({ database, defaultAccessMode: 'WRITE' })

    return session.writeTransaction(work)
        .then(res => session.close().then(() => res))

}

export async function close() {
    return driver.close()
}