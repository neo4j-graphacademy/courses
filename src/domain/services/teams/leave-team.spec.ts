import initNeo4j, { read, write, close } from '../../../modules/neo4j'
import { User } from '../../model/user'
import leaveTeam from './leave-team'
import createTeam from './create-team'
import { config } from 'dotenv'

describe('leaveTeam', () => {
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

    const memberUser = {
        sub: 'member-user-id',
        email: 'member@example.com',
        givenName: 'Member User'
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
            sub2: memberUser.sub
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
            sub2: memberUser.sub,
            email2: memberUser.email,
            givenName2: memberUser.givenName
        })
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
            sub2: memberUser.sub
        })
    })

    it('should successfully leave team as a member', async () => {
        // Create a team
        const { team: createdTeam } = await createTeam(
            testUser,
            'Test Team',
            'Test Description',
            true,
            true
        )

        expect(createdTeam).toBeDefined()

        if (createdTeam) {
            // Add member user to team
            await write(`
                MATCH (u:User {sub: $sub}), (t:Team {id: $teamId})
                CREATE (u)-[:MEMBER_OF]->(t)
            `, {
                sub: memberUser.sub,
                teamId: createdTeam.id
            })

            // Leave team
            const result = await leaveTeam(memberUser, createdTeam.id)

            expect(result).toBeDefined()
            expect(result?.id).toBe(createdTeam.id)

            // Verify database state - relationship should be gone
            const dbResult = await read(`
                MATCH (u:User {sub: $sub})-[r:MEMBER_OF]->(t:Team {id: $teamId})
                RETURN r
            `, {
                sub: memberUser.sub,
                teamId: createdTeam.id
            })

            expect(dbResult.records).toHaveLength(0)
        }
    })

    it('should return undefined when trying to leave non-member team', async () => {
        // Create a team
        const { team: createdTeam } = await createTeam(
            testUser,
            'Test Team',
            'Test Description',
            true,
            true
        )

        expect(createdTeam).toBeDefined()

        if (createdTeam) {
            // Try to leave team without being a member
            const result = await leaveTeam(memberUser, createdTeam.id)

            expect(result).toBeUndefined()
        }
    })

    it('should return undefined for non-existent team', async () => {
        const result = await leaveTeam(memberUser, 'non-existent-team')
        expect(result).toBeUndefined()
    })

    it('should allow admin to leave team', async () => {
        // Create a team (creator is admin)
        const { team: createdTeam } = await createTeam(
            testUser,
            'Test Team',
            'Test Description',
            true,
            true
        )

        expect(createdTeam).toBeDefined()

        if (createdTeam) {
            const result = await leaveTeam(testUser, createdTeam.id)

            expect(result).toBeDefined()
            expect(result?.id).toBe(createdTeam.id)

            // Verify database state - admin relationship should be gone
            const dbResult = await read(`
                MATCH (u:User {sub: $sub})-[r:MEMBER_OF]->(t:Team {id: $teamId})
                RETURN r
            `, {
                sub: testUser.sub,
                teamId: createdTeam.id
            })

            expect(dbResult.records).toHaveLength(0)
        }
    })

    it('should maintain team existence after member leaves', async () => {
        // Create a team
        const { team: createdTeam } = await createTeam(
            testUser,
            'Test Team',
            'Test Description',
            true,
            true
        )

        expect(createdTeam).toBeDefined()

        if (createdTeam) {
            // Add member user to team
            await write(`
                MATCH (u:User {sub: $sub}), (t:Team {id: $teamId})
                CREATE (u)-[:MEMBER_OF]->(t)
            `, {
                sub: memberUser.sub,
                teamId: createdTeam.id
            })

            // Leave team
            await leaveTeam(memberUser, createdTeam.id)

            // Verify team still exists
            const dbResult = await read(`
                MATCH (t:Team {id: $teamId})
                RETURN t.id AS id
            `, {
                teamId: createdTeam.id
            })

            expect(dbResult.records).toHaveLength(1)
            expect(dbResult.records[0].get('id')).toBe(createdTeam.id)
        }
    })
}) 