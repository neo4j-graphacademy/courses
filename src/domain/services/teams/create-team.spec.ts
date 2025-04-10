import initNeo4j, { read, write, close } from '../../../modules/neo4j'
import { User } from '../../model/user'
import createTeam from './create-team'
import { config } from 'dotenv'
import { emitter } from '../../../events'
import UserCreatedTeam from '../../events/UserCreatedTeam'

// Mock the emitter
jest.mock('../../../events', () => ({
    emitter: {
        emit: jest.fn()
    }
}))

describe('createTeam', () => {
    beforeAll(async () => {
        config()
        await initNeo4j(process.env.NEO4J_HOST as string, process.env.NEO4J_USERNAME as string, process.env.NEO4J_PASSWORD as string)
    })

    afterAll(async () => {
        await close()
    })

    const testUser = {
        sub: 'test-user-id',
        email: 'test@example.com',
        givenName: 'Test User'
    } as User

    // Clean up test data before each test
    beforeEach(async () => {
        // Delete only the test user and related nodes
        await write(`
            MATCH (u:User {sub: $sub})
            OPTIONAL MATCH (u)-[r]->(t:Team)
            DETACH DELETE u, t
        `, { sub: testUser.sub })

        // Create fresh test user
        await write(`
            MERGE (u:User {sub: $sub})
            SET u.email =  $email,
                u.givenName = $givenName
        `, testUser)

        jest.clearAllMocks()
    })

    it('should create a public team successfully', async () => {
        const result = await createTeam(
            testUser,
            'Test Team',
            'Test Description',
            true, // public
            true, // open
            ['test.com']
        )

        expect(result.errors).toBeUndefined()
        expect(result.team).toBeDefined()

        if (result.team) {
            expect(result.team.id).toBeDefined()
            expect(result.team).toEqual(expect.objectContaining({
                name: 'Test Team',
                description: 'Test Description',
                public: true,
                open: true,
            }))
        }

        // Verify event was emitted
        expect(emitter.emit).toHaveBeenCalledWith(
            expect.any(UserCreatedTeam)
        )

        // Verify database state
        const dbResult = await read(`
            MATCH (u:User {sub: $sub})-[r:MEMBER_OF]->(t:Team)
            RETURN t, r.role as role
        `, { sub: testUser.sub })

        expect(dbResult.records).toHaveLength(1)
        expect(dbResult.records[0].get('role')).toBe('admin')
    })

    it('should create a private team with PIN', async () => {
        const result = await createTeam(
            testUser,
            'Private Team',
            'Private Description',
            false, // not public
            true  // open
        )

        expect(result.errors).toBeUndefined()
        expect(result.team).toBeDefined()

        if (result.team) {
            expect(result.team).toEqual(expect.objectContaining({
                name: 'Private Team',
                description: 'Private Description',
                public: false,
                open: true
            }))
            expect(result.team.pin).toMatch(/^\d{6}$/) // Should be a 6-digit PIN
        }
    })

    it('should return error for empty team name', async () => {
        const result = await createTeam(
            testUser,
            '', // empty name
            'Test Description',
            true,
            true
        )

        expect(result.errors).toBeDefined()
        expect(result.errors?.name).toBe('Please enter a team name.')
        expect(result.team).toBeUndefined()
        expect(emitter.emit).not.toHaveBeenCalled()
    })

    it('should return error for non-existent user', async () => {
        // Delete only the test user
        await write(`
            MATCH (u:User {sub: $sub}) DELETE u
        `, { sub: testUser.sub })

        const result = await createTeam(
            testUser,
            'Test Team',
            'Test Description',
            true,
            true
        )

        expect(result.errors).toBeDefined()
        expect(result.errors?.user).toBe('User not found')
        expect(result.team).toBeUndefined()
        expect(emitter.emit).not.toHaveBeenCalled()
    })

    it('should create team with default values when optional params are omitted', async () => {
        const result = await createTeam(
            testUser,
            'Test Team',
            'Test Description'
            // omitting isPublic, open, and domains
        )

        expect(result.errors).toBeUndefined()
        expect(result.team).toBeDefined()

        if (result.team) {
            expect(result.team).toEqual(expect.objectContaining({
                name: 'Test Team',
                description: 'Test Description',
                public: false,    // default value
                open: true,       // default value
                domains: []       // default value
            }))
        }
    })
}) 