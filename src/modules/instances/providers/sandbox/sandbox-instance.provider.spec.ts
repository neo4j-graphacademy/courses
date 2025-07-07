// import axios from 'axios'
import { SandboxInstanceProvider } from './sandbox-instance.provider'
import { SANDBOX_URL, NEO4J_HOST, NEO4J_USERNAME, NEO4J_PASSWORD } from '../../../../constants'
import { User } from '../../../../domain/model/user'
import initNeo4j, { close } from '../../../neo4j'
import { config } from 'dotenv'

config()

const {
    SANDBOX_TOKEN = ''
} = process.env

const user = {
    sub: 'test-sandbox|1234567890'
} as User

describe('SandboxInstanceProvider', () => {
    let provider: SandboxInstanceProvider

    beforeAll(async () => {
        await initNeo4j(NEO4J_HOST as string, NEO4J_USERNAME as string, NEO4J_PASSWORD as string)
    })

    beforeEach(async () => {
        provider = new SandboxInstanceProvider()
    })

    afterAll(async () => {
        await close()
    })

    describe('getInstancees', () => {
        it('should get sandboxes for a user', async () => {
            const sandboxes = await provider.getInstances(SANDBOX_TOKEN, {} as User)

            expect(Array.isArray(sandboxes)).toBe(true)
        }, 30000)
    })
    describe('getOrcreateInstanceForUseCase', () => {
        it('should create a sandbox', async () => {
            const first = await provider.getOrCreateInstanceForUseCase(SANDBOX_TOKEN, user, 'recommendations')
            const second = await provider.getOrCreateInstanceForUseCase(SANDBOX_TOKEN, user, 'recommendations')

            expect(first.sandboxHashKey).toEqual(second.sandboxHashKey)

            const all = await provider.getInstances(SANDBOX_TOKEN, user)
            expect(all.length).toBeGreaterThan(0)

            expect(all.find(sandbox => sandbox.sandboxHashKey === first.sandboxHashKey)).toBeDefined()

            const get = await provider.getInstanceForUseCase(SANDBOX_TOKEN, user, 'recommendations')

            expect(get).toBeDefined()
            expect(get!.sandboxHashKey).toEqual(first.sandboxHashKey)
            expect(get!.sandboxHashKey).toEqual(second.sandboxHashKey)
        }, 60000)
    })

    describe('createInstanceForUseCase', () => {
        it('should create a sandbox', async () => {
            const first = await provider.getOrCreateInstanceForUseCase(SANDBOX_TOKEN, user, 'recommendations')
            const second = await provider.getOrCreateInstanceForUseCase(SANDBOX_TOKEN, user, 'recommendations')

            expect(first.sandboxHashKey).toEqual(second.sandboxHashKey)

            const all = await provider.getInstances(SANDBOX_TOKEN, user)
            expect(all.length).toBeGreaterThan(0)

            expect(all.find(sandbox => sandbox.sandboxHashKey === first.sandboxHashKey)).toBeDefined()

            const get = await provider.getInstanceForUseCase(SANDBOX_TOKEN, user, 'recommendations')

            expect(get).toBeDefined()
            expect(get!.sandboxHashKey).toEqual(first.sandboxHashKey)
            expect(get!.sandboxHashKey).toEqual(second.sandboxHashKey)

            // get by hash key
            const getByHashKey = await provider.getInstanceById(SANDBOX_TOKEN, user, first.sandboxHashKey)

            expect(getByHashKey).toBeDefined()
            expect(getByHashKey!.instance.sandboxHashKey).toEqual(first.sandboxHashKey)
        }, 50000)
    })

    describe('createInstance', () => {
        it('should create a sandbox', async () => {
            const usecase = 'pole'

            const first = await provider.createInstance(SANDBOX_TOKEN, user, usecase)
            const second = await provider.createInstance(SANDBOX_TOKEN, user, usecase)

            expect(first.sandboxHashKey).toEqual(second.sandboxHashKey)

            const all = await provider.getInstances(SANDBOX_TOKEN, user)

            expect(all.find(sandbox => sandbox.sandboxHashKey === first.sandboxHashKey)).toBeDefined()

            const get = await provider.getInstanceForUseCase(SANDBOX_TOKEN, user, usecase)

            expect(get).toBeDefined()
            expect(get!.sandboxHashKey).toEqual(first.sandboxHashKey)
            expect(get!.sandboxHashKey).toEqual(second.sandboxHashKey)
            expect(get!.id).toEqual(first.id)
            expect(get!.id).toEqual(second.id)

            // Execute cypher 
            const result = await provider.executeCypher(SANDBOX_TOKEN, user, usecase, 'CREATE (n:__Test {createdAt: datetime()}) RETURN toString(n.createdAt) AS createdAt', {}, "WRITE")

            expect(result).toBeDefined()
            expect(result!.records.length).toBeGreaterThan(0)
            expect(result!.records[0].get('createdAt')).toBeDefined()

            const createdAt = result!.records[0].get('createdAt')

            // Read it back 
            const read = await provider.executeCypher(SANDBOX_TOKEN, user, usecase, 'MATCH (n:__Test) RETURN toString(n.createdAt) AS createdAt ORDER BY n.createdAt DESC LIMIT 1', {}, "READ")

            expect(read).toBeDefined()
            expect(read!.records.length).toBeGreaterThan(0)
            expect(read!.records[0].get('createdAt')).toEqual(createdAt)
        }, 60000)
    })
})
