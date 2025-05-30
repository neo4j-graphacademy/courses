import { AuraInstanceProvider } from './aura-instance.provider'
import { NEO4J_HOST, NEO4J_USERNAME, NEO4J_PASSWORD, AURA_CLIENT_SECRET, AURA_CLIENT_ID, AURA_API_URL } from '../../../../constants'
import { User } from '../../../../domain/model/user'
import initNeo4j, { close } from '../../../neo4j'
import { config } from 'dotenv'

config()

const user = {
    sub: 'google-oauth2|113046196349780988147',
} as User

describe('AuraInstanceProvider', () => {
    let provider: AuraInstanceProvider
    let instances: string[] = []

    beforeAll(async () => {
        await initNeo4j(NEO4J_HOST as string, NEO4J_USERNAME as string, NEO4J_PASSWORD as string)
        provider = await AuraInstanceProvider.create()
    })

    afterAll(async () => {
        for (const instance of instances) {
            await provider.stopInstance('', user, instance)
        }

        close()
    })

    describe('Configuration', () => {
        it('should be configured', () => {
            expect(AURA_API_URL).toBeDefined()
            expect(AURA_CLIENT_ID).toBeDefined()
            expect(AURA_CLIENT_SECRET).toBeDefined()
        })
    })

    describe('getInstances', () => {
        it('should get instances for a user', async () => {
            const instances = await provider.getInstances('', {} as User)

            expect(instances).toBeInstanceOf(Array)
        })
    })

    // describe('getOrCreateInstanceForUseCase', () => {
    //     it('should create an instance', async () => {
    //         jest.setTimeout(30000)

    //         const first = await provider.getOrCreateInstanceForUseCase('', user, 'recommendations')
    //         const second = await provider.getOrCreateInstanceForUseCase('', user, 'recommendations')

    //         expect(first.hashKey).toEqual(second.hashKey)

    //         const all = await provider.getInstances('', user)
    //         expect(all.length).toBeGreaterThan(0)

    //         expect(all.find(instance => instance.hashKey === first.hashKey)).toBeDefined()

    //         const get = await provider.getInstanceForUseCase('', user, 'recommendations')

    //         expect(get).toBeDefined()
    //         expect(get!.hashKey).toEqual(first.hashKey)
    //         expect(get!.hashKey).toEqual(second.hashKey)
    //     })
    // })

    // describe('createInstanceForUseCase', () => {
    //     it('should create an instance', async () => {
    //         jest.setTimeout(30000)

    //         const first = await provider.getOrCreateInstanceForUseCase('', user, 'recommendations')
    //         const second = await provider.getOrCreateInstanceForUseCase('', user, 'recommendations')

    //         expect(first.hashKey).toEqual(second.hashKey)

    //         const all = await provider.getInstances('', user)
    //         expect(all.length).toBeGreaterThan(0)

    //         expect(all.find(instance => instance.hashKey === first.hashKey)).toBeDefined()

    //         const get = await provider.getInstanceForUseCase('', user, 'recommendations')

    //         expect(get).toBeDefined()
    //         expect(get!.hashKey).toEqual(first.hashKey)
    //         expect(get!.hashKey).toEqual(second.hashKey)

    //         // get by hash key
    //         const getByHashKey = await provider.getInstanceById('', user, first.hashKey)

    //         expect(getByHashKey).toBeDefined()
    //         expect(getByHashKey.instance.hashKey).toEqual(first.hashKey)
    //     })
    // })

    describe('createInstance', () => {
        it('should create an instance', async () => {
            jest.setTimeout(30000)

            const usecase = 'blank-sandbox'

            const first = await provider.createInstance('', user, usecase)

            // wait for a second
            await new Promise(resolve => setTimeout(resolve, 1000));

            instances.push(first.id)

            const second = await provider.createInstance('', user, usecase)
            instances.push(second.id)

            expect(first.hashKey).toEqual(second.hashKey)

            const all = await provider.getInstances('', user)

            expect(all.find(instance => instance.hashKey === first.hashKey)).toBeDefined()

            const get = await provider.getInstanceForUseCase('', user, usecase)

            if (get) {
                instances.push(get.id)
            }

            expect(get).toBeDefined()
            expect(get!.hashKey).toEqual(first.hashKey)
            expect(get!.hashKey).toEqual(second.hashKey)

            await provider.stopInstance('', user, first.id)
        })
    })
}) 