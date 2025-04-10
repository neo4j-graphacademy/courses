import initNeo4j, { read, write, close } from '../../../modules/neo4j'
import { User } from '../../model/user'
import getTeam from './get-team'
import createTeam from './create-team'
import { config } from 'dotenv'


describe('getTeam', () => {
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

    // Clean up database before each test
    beforeEach(async () => {
        // await write(`
        //     MATCH (n) DETACH DELETE n
        // `)

        await write(`
            MERGE (u:User {
                sub: $sub,
                email: $email,
                givenName: $givenName
            })
        `, testUser)
    })

    it('should get a team with its courses', async () => {
        // Create a test team first
        const { team: createdTeam } = await createTeam(
            testUser,
            'Test Team',
            'Test Description',
            true, // public
            true  // open
        )

        expect(createdTeam).toBeDefined()

        if (createdTeam) {

            // Get the team
            const result = await getTeam(createdTeam.id, testUser)

            expect(result.team).toBeDefined()
            expect(result.membership).toBeDefined()
            expect(result.team).toEqual(expect.objectContaining({
                name: 'Test Team',
                description: 'Test Description'
            }))
            if (result.membership) {
                expect(result.membership.isMember).toBe(true)
                expect(result.membership.isAdmin).toBe(true)
            }
        }
    })

    it('should return courses if team has a learning path', async () => {
        // Create a test team
        const { team: createdTeam } = await createTeam(
            testUser,
            'Test Team',
            'Test Description',
            true,
            true
        )

        if (createdTeam) {
            // Add a course to the database and link it to the team
            await write(`
                CREATE (c:Course {
                    slug: 'test-course',
                    title: 'Test Course'
                })
                WITH c
                MATCH (t:Team {id: $teamId})
                CREATE (c)-[:ON_LEARNING_PATH_FOR {order: 0}]->(t)
            `, { teamId: createdTeam.id })

            // Get the team
            const result = await getTeam(createdTeam.id, testUser)

            expect(result.courses).toBeDefined()
            expect(result.courses).toHaveLength(1)

            if (result.courses?.length) {
                expect(result.courses[0].slug).toBe('test-course')
            }
        }
    })

    it('should return undefined for non-existent team', async () => {
        const result = await getTeam('non-existent-id', testUser)
        expect(result.team).toBeUndefined()
    })
}) 