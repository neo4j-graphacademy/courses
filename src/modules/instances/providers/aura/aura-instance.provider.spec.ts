import { AuraInstanceProvider } from './aura-instance.provider'
import { NEO4J_HOST, NEO4J_USERNAME, NEO4J_PASSWORD, AURA_CLIENT_SECRET, AURA_CLIENT_ID, AURA_API_URL, AURA_TENANT_ID } from '../../../../constants'
import { User } from '../../../../domain/model/user'
import initNeo4j, { close, read, write } from '../../../neo4j'
import { config } from 'dotenv'

config()

jest.setTimeout(10000)

const user = {
    sub: 'test-oauth2|1234567890',
} as User

describe('AuraInstanceProvider', () => {
    let provider: AuraInstanceProvider
    let instances: string[] = []
    let testSuiteToken: string;

    beforeAll(async () => {
        if (!AURA_CLIENT_ID || !AURA_CLIENT_SECRET || !AURA_TENANT_ID) {
            throw new Error('AURA_CLIENT_ID, AURA_CLIENT_SECRET, and AURA_TENANT_ID environment variables must be set for integration tests.')
        }

        // connect to neo4j
        await initNeo4j(NEO4J_HOST as string, NEO4J_USERNAME as string, NEO4J_PASSWORD as string)

        // create a user in the database
        await write(`MERGE (u:User {sub: $sub})`, { sub: user.sub })
    })

    afterAll(async () => {

        // // console.log('Running afterAll cleanup for instances:', instances)
        // if (!provider) {
        //     console.warn('Provider not initialized in afterAll, skipping instance cleanup via API.')
        // }
        // for (const instanceId of Array.from(new Set(instances))) {
        //     if (!instanceId) continue
        //     try {
        //         if (provider && testSuiteToken) {
        //             // console.log(`Attempting to stop instance ${instanceId} via API...`)
        //             await provider.stopInstance(testSuiteToken, user, instanceId);
        //             // console.log(`Stop command sent for instance ${instanceId}.`)
        //         } else {
        //             console.warn(`Provider or testSuiteToken not available, cannot stop instance ${instanceId} via API.`)
        //         }
        //         // console.log(`Cleaning up instance ${instanceId} from DB...`)
        //         await write(`MATCH (u:User {sub: $sub})-[:HAS_INSTANCE]->(i:Instance {id: $instanceId}) DETACH DELETE i;`, { sub: user.sub, instanceId })
        //         // console.log(`DB cleanup attempted for ${instanceId}.`)
        //     } catch (e: any) {
        //         console.error(`Error stopping/cleaning instance ${instanceId} during teardown:`, e.message)
        //         try {
        //             // console.log(`Attempting DB cleanup for ${instanceId} after error...`)
        //             await write(`MATCH (u:User {sub: $sub})-[:HAS_INSTANCE]->(i:Instance {id: $instanceId}) DETACH DELETE i;`, { sub: user.sub, instanceId })
        //             // console.log(`DB cleanup for ${instanceId} re-attempted after error.`)
        //         } catch (dbError: any) {
        //             console.error(`Error during final DB cleanup for instance ${instanceId}:`, dbError.message)
        //         }
        //     }
        // }
        // instances = []

        await close()
        // console.log('Neo4j connection closed.')
    })

    beforeEach(async () => {
        await write(`MATCH (u:User {sub: $sub})-[:HAS_INSTANCE]->(i:Instance) DETACH DELETE i;`, { sub: user.sub })
    })

    describe('Configuration', () => {
        it('should have Aura environment variables defined (checked in beforeAll)', () => {
            expect(AURA_API_URL).toBeDefined()
            expect(AURA_CLIENT_ID).toBeDefined()
            expect(AURA_CLIENT_SECRET).toBeDefined()
            expect(AURA_TENANT_ID).toBeDefined()
        })

        it('should generate a token', async () => {
            const token = await AuraInstanceProvider.generateToken();
            expect(token).toBeDefined()
        })
    })

    describe('Database and API Interaction Scenarios (Integration)', () => {
        it('should handle a stale database record (non-existent in Aura) by creating a new instance', async () => {
            const usecase = `stale-db-real-${Date.now()}`
            const staleInstanceId = `fake-aura-id-${Date.now()}`

            await write(`
                MERGE (u:User {sub: $sub})
                CREATE (i:Instance {id: $staleInstanceId, usecase: $usecase, hashKey: 'stale-hashkey', status: 'ORPHANED'})
                CREATE (u)-[:HAS_INSTANCE]->(i);
            `, { sub: user.sub, staleInstanceId, usecase })


            const retrievedInstance = await provider.getInstanceForUseCase(testSuiteToken, user, usecase);

            expect(retrievedInstance).toBeDefined()
            expect(retrievedInstance?.id).not.toBe(staleInstanceId)
        })
    })

    describe('getOrCreateInstanceForUseCase (Integration)', () => {
        it('should create an instance if none exists, and reuse it on subsequent calls', async () => {
            const usecase = `goc-real-${Date.now()}`

            let firstInstance = await provider.getOrCreateInstanceForUseCase(testSuiteToken, user, usecase, false, false);
            instances.push(firstInstance.id)

            const checkAfterCreation = await provider.getInstanceById(testSuiteToken, user, firstInstance.id);

            expect(checkAfterCreation.instance).toBeDefined()
            expect(checkAfterCreation.instance!.id).toBe(firstInstance.id)
            expect(checkAfterCreation.instance!.hashKey).toEqual(firstInstance.hashKey)

            let secondInstance = await provider.getOrCreateInstanceForUseCase(testSuiteToken, user, usecase, false, false);
            expect(secondInstance).toBeDefined()
            expect(secondInstance.id).toBe(firstInstance.id)
            expect(secondInstance.hashKey).toEqual(firstInstance.hashKey)

            const dbCheck = await read(`MATCH (u:User {sub: $sub})-[:HAS_INSTANCE]->(i:Instance {usecase: $usecase}) RETURN i;`, { sub: user.sub, usecase, instanceId: firstInstance.id })
            expect(dbCheck.records.length).toBe(1)
            expect(dbCheck.records[0].get('i').properties.id).toBe(firstInstance.id)
            expect(dbCheck.records[0].get('i').properties.username).toBeDefined()
            expect(dbCheck.records[0].get('i').properties.password).toBeDefined()
        })
    })

    describe('createInstance (Integration)', () => {
        it('should create a new instance and record it in the database', async () => {
            const usecase = `create-real-${Date.now()}`

            const createdInstance = await provider.createInstance(testSuiteToken, user, usecase, false, false);
            expect(createdInstance).toBeDefined()
            expect(createdInstance.usecase).toBe(usecase)
            expect(createdInstance.username).toBeDefined()
            expect(createdInstance.password).toBeDefined()

            instances.push(createdInstance.id)

            const dbCheck = await read(
                `MATCH (u:User {sub: $sub})-[:HAS_INSTANCE]->(i:Instance {id: $instanceId, usecase: $usecase}) RETURN i;`,
                { sub: user.sub, instanceId: createdInstance.id, usecase }
            )
            expect(dbCheck.records.length).toBe(1)
            const dbInstance = dbCheck.records[0].get('i').properties

            expect(dbInstance).toBeDefined()
            expect(dbInstance.id).toBe(createdInstance.id)
            expect(dbInstance.usecase).toBe(usecase)

            const finalCheck = await provider.getInstanceById(testSuiteToken, user, createdInstance.id);
            expect(finalCheck.instance).toBeDefined()
        }, 120000)
    })
}) 
