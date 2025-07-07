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
        })
    })
    describe('getOrcreateInstanceForUseCase', () => {
        it('should create a sandbox', async () => {
            jest.setTimeout(30000)

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
        })
    })

    describe('createInstanceForUseCase', () => {
        it('should create a sandbox', async () => {
            jest.setTimeout(30000)

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
        })

    })

    describe('createInstance', () => {
        it('should create a sandbox', async () => {
            jest.setTimeout(30000)

            const usecase = 'blank-sandbox'

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
        })
    })
})
