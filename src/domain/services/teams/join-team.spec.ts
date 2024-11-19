import initNeo4j, { read, write, close } from '../../../modules/neo4j'
import { User } from '../../model/user'
import joinTeam from './join-team'
import createTeam from './create-team'
import { config } from 'dotenv'
import { emitter } from '../../../events'
import { UserJoinedTeam } from '../../events/UserJoinedTeam'

// Mock the emitter
jest.mock('../../../events', () => ({
    emitter: {
        emit: jest.fn()
    }
}))

describe('joinTeam', () => {
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

    const joiningUser = {
        sub: 'joining-user-id',
        email: 'joining@example.com',
        givenName: 'Joining User'
    } as User

    // Clean up test data before each test
    beforeEach(async () => {
        // Delete test users and related nodes
        await write(`
            MATCH (u:User)
            WHERE u.sub IN [$sub1, $sub2]
            OPTIONAL MATCH (u)-[r]->(t:Team)
            DETACH DELETE u, t
        `, {
            sub1: testUser.sub,
            sub2: joiningUser.sub
        })

        // Create fresh test users
        await write(`
            CREATE (u1:User {
                sub: $sub1,
                email: $email1,
                givenName: $givenName1
            }),
            (u2:User {
                sub: $sub2,
                email: $email2,
                givenName: $givenName2
            })
        `, {
            sub1: testUser.sub,
            email1: testUser.email,
            givenName1: testUser.givenName,
            sub2: joiningUser.sub,
            email2: joiningUser.email,
            givenName2: joiningUser.givenName
        })

        jest.clearAllMocks()
    })

    // Clean up after each test
    afterEach(async () => {
        await write(`
            MATCH (u:User)
            WHERE u.sub IN [$sub1, $sub2]
            OPTIONAL MATCH (u)-[r]->(t:Team)
            DETACH DELETE u, t
        `, {
            sub1: testUser.sub,
            sub2: joiningUser.sub
        })
    })

    it('should successfully join public team', async () => {
        // Create a public team
        const { team: createdTeam } = await createTeam(
            testUser,
            'Public Team',
            'Test Description',
            true, // public
            true  // open
        )

        expect(createdTeam).toBeDefined()

        if (createdTeam) {
            const result = await joinTeam(joiningUser, createdTeam.id)

            expect(result.error).toBeUndefined()
            expect(result.team).toBeDefined()
            expect(result.team?.id).toBe(createdTeam.id)

            // Verify event was emitted
            expect(emitter.emit).toHaveBeenCalledWith(
                expect.any(UserJoinedTeam)
            )

            // Verify database state
            const dbResult = await read(`
                MATCH (u:User {sub: $sub})-[r:MEMBER_OF]->(t:Team {id: $teamId})
                RETURN r.createdAt
            `, {
                sub: joiningUser.sub,
                teamId: createdTeam.id
            })

            expect(dbResult.records).toHaveLength(1)
            expect(dbResult.records[0].get('r.createdAt')).toBeDefined()
        }
    })

    it('should successfully join private team with correct PIN', async () => {
        // Create a private team
        const { team: createdTeam } = await createTeam(
            testUser,
            'Private Team',
            'Test Description',
            false, // not public
            true   // open
        )

        expect(createdTeam).toBeDefined()

        if (createdTeam) {
            const result = await joinTeam(joiningUser, createdTeam.id, createdTeam.pin)

            expect(result.error).toBeUndefined()
            expect(result.team).toBeDefined()
            expect(result.team?.id).toBe(createdTeam.id)

            // Verify event was emitted
            expect(emitter.emit).toHaveBeenCalledWith(
                expect.any(UserJoinedTeam)
            )

            // Verify database state
            const dbResult = await read(`
                MATCH (u:User {sub: $sub})-[r:MEMBER_OF]->(t:Team {id: $teamId})
                RETURN r.createdAt
            `, {
                sub: joiningUser.sub,
                teamId: createdTeam.id
            })

            expect(dbResult.records).toHaveLength(1)
            expect(dbResult.records[0].get('r.createdAt')).toBeDefined()
        }
    })

    it('should fail to join private team with incorrect PIN', async () => {
        // Create a private team
        const { team: createdTeam } = await createTeam(
            testUser,
            'Private Team',
            'Test Description',
            false, // not public
            true   // open
        )

        expect(createdTeam).toBeDefined()

        if (createdTeam) {
            const result = await joinTeam(joiningUser, createdTeam.id, 'incorrect-pin')

            expect(result.error).toBeDefined()
            expect(result.team).toBeUndefined()
        }
    })
}) 