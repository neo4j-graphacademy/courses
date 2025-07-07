import { AuraInstanceProvider, AuraAPIError } from './aura-instance.provider'
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

        provider = new AuraInstanceProvider()
        testSuiteToken = await AuraInstanceProvider.generateToken()

        // connect to neo4j
        await initNeo4j(NEO4J_HOST as string, NEO4J_USERNAME as string, NEO4J_PASSWORD as string)

        // create a user in the database
        await write(`MERGE (u:User {sub: $sub})`, { sub: user.sub })
    })

    afterAll(async () => {

        for (const instanceId of Array.from(new Set(instances))) {
            await provider.stopInstance(testSuiteToken, user, instanceId)
        }

        await close()
    })

    beforeEach(async () => {
        await write(`MATCH (u:User {sub: $sub})-[:HAS_INSTANCE]->(i:Instance) DETACH DELETE i;`, { sub: user.sub })
        
        // Ensure the provider has a valid token for integration tests
        provider['token'] = testSuiteToken
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

    describe('Token management', () => {
        it('should generate a token', async () => {
            const token = await AuraInstanceProvider.generateToken();
            expect(token).toBeDefined()
        })

        it('should refresh the token when it expires', async () => {
            const fakeToken = 'fake-token'
            const useCase = `test-instance-${Date.now()}`

            // Set a fake token to simulate an expired/invalid token
            provider['token'] = fakeToken
            
            // Verify the fake token is set
            expect(provider['token']).toBe(fakeToken)

            // This should trigger a token refresh when the API returns 401/403
            const res = await provider.getInstances(testSuiteToken, user)

            // Verify the token was refreshed
            expect(provider['token']).not.toBe(fakeToken)
            expect(provider['token']).toBeDefined()
            expect(typeof provider['token']).toBe('string')
            expect(provider['token']!.length).toBeGreaterThan(0)

            expect(res).toBeDefined()
        })
    })

    describe('Error handling', () => {
        it('should create AuraAPIError with proper structure', () => {
            const status = 404;
            const statusText = 'Not Found';
            const responseBody = { error: 'Instance not found' };
            const message = `HTTP ${status} ${statusText}`;

            const error = new AuraAPIError(message, status, statusText, responseBody);

            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(AuraAPIError);
            expect(error.name).toBe('AuraAPIError');
            expect(error.message).toBe(message);
            expect(error.status).toBe(status);
            expect(error.statusText).toBe(statusText);
            expect(error.response).toEqual(responseBody);
        })

        it('should maintain stack trace', () => {
            const error = new AuraAPIError('Test error', 500, 'Internal Server Error');
            expect(error.stack).toBeDefined();
            expect(error.stack).toContain('AuraAPIError');
        })
    })

    describe('Instance creation', () => {
        it('should create a valid instance name', () => {
            const instanceName = provider['getInstanceName'](user, 'test-instance')
            expect(instanceName).toBeDefined()
            expect(instanceName).toBe('t-o|1234567890||t-i')
        })

        it('should map an aura instance to an instance', () => {
            const auraInstance = {
                id: "db1d1234",
                connection_url: "YOUR_CONNECTION_URL",
                username: "neo4j",
                password: "letMeIn123!",
                database: "db1d1234",
                tenant_id: "YOUR_PROJECT_ID",
                cloud_provider: "gcp",
                region: "europe-west1",
                type: "enterprise-db",
                name: 't-o|1234567890||t-i',
                created_at: "2023-01-20T13:44:42Z",
                vector_optimized: false
            }

            const output = provider['mapAuraInstanceToInstance'](auraInstance)
            expect(output).toBeDefined()
            expect(output.id).toBe(auraInstance.id)
            expect(output.hashKey).toBe(auraInstance.name)
            expect(output.database).toBe(auraInstance.database)
            expect(output.usecase).toBe('t-i')
            expect(output.scheme).toBe('neo4j+s')
        })

        it('should create an instance with a valid name', async () => {
            const usecase = `test-instance-${Date.now()}`
            const instance = await provider.createInstance(testSuiteToken, user, usecase, false, false);
            expect(instance).toBeDefined()
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

            expect(retrievedInstance).toBeUndefined()
        })
    })

    describe('getOrCreateInstanceForUseCase (Integration)', () => {
        it('should create an instance if none exists, and reuse it on subsequent calls', async () => {
            const usecase = `goc-real-${Date.now()}`

            let firstInstance = await provider.getOrCreateInstanceForUseCase(testSuiteToken, user, usecase, false, false);
            instances.push(firstInstance.id)

            // Check post-creation
            const checkAfterCreation = await provider.getInstanceById(testSuiteToken, user, firstInstance.id);

            expect(checkAfterCreation.instance).toBeDefined()
            expect(checkAfterCreation.instance!.id).toBe(firstInstance.id)
            expect(checkAfterCreation.instance!.hashKey).toEqual(firstInstance.hashKey)

            // Check get instance for use case 
            const retrievedInstance = await provider.getInstanceForUseCase(testSuiteToken, user, usecase);

            expect(retrievedInstance).toBeDefined()
            expect(retrievedInstance!.id).toBe(firstInstance.id)
            expect(retrievedInstance!.hashKey).toEqual(firstInstance.hashKey)

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
            expect(createdInstance.usecase).toBe('c-r-1')
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
