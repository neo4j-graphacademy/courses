import initNeo4j, { read, write, close } from '../../../modules/neo4j'
import { User } from '../../model/user'
import { getTeamProgress } from './get-team-progress'
import createTeam from './create-team'
import { config } from 'dotenv'
import NotFoundError from '../../../errors/not-found.error'

describe('getTeamProgress', () => {
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
        givenName: 'Test User',
        id: 'test-user-id',
        position: 'Developer',
        company: 'Test Co',
        country: 'UK'
    } as User

    const secondUser = {
        sub: 'second-user-id',
        email: 'second@example.com',
        givenName: 'Second User',
        id: 'second-user-id',
        position: 'Manager',
        company: 'Test Co',
        country: 'US'
    } as User

    // Clean up database before each test
    beforeEach(async () => {
        await write(`
            MATCH (n) DETACH DELETE n
        `)

        await write(`
            MERGE (u1:User {
                sub: $sub1,
                id: $id1,
                email: $email1,
                givenName: $givenName1,
                position: $position1,
                company: $company1,
                country: $country1
            })
            MERGE(u2:User {
                sub: $sub2,
                id: $id2,
                email: $email2,
                givenName: $givenName2,
                position: $position2,
                company: $company2,
                country: $country2
            })
        `, {
            sub1: testUser.sub,
            id1: testUser.id,
            email1: testUser.email,
            givenName1: testUser.givenName,
            position1: testUser.position,
            company1: testUser.company,
            country1: testUser.country,
            sub2: secondUser.sub,
            id2: secondUser.id,
            email2: secondUser.email,
            givenName2: secondUser.givenName,
            position2: secondUser.position,
            company2: secondUser.company,
            country2: secondUser.country
        })
    })

    it('should get team progress with members and courses', async () => {
        // Create a test team
        const { team: createdTeam } = await createTeam(
            testUser,
            'Test Team',
            'Test Description',
            true,
            true
        )

        expect(createdTeam).toBeDefined()

        if (createdTeam) {
            // Add second user to team
            await write(`
                MATCH (u:User {sub: $sub}), (t:Team {id: $teamId})
                CREATE (u)-[:MEMBER_OF]->(t)
            `, { sub: secondUser.sub, teamId: createdTeam.id })

            // Add a course and some enrolments
            await write(`
                MATCH (t:Team {id: $teamId}) 
                MATCH (u:User {sub: $userSub}) WITH t, u

                CREATE (c:Course {
                    slug: 'test-course',
                    title: 'Test Course'
                })
                CREATE (c)-[:ON_LEARNING_PATH_FOR {order: 0}]->(t)
                CREATE (u)-[:HAS_ENROLMENT]->(e:Enrolment:CompletedEnrolment)-[:FOR_COURSE]->(c)
            `, {
                teamId: createdTeam.id,
                userSub: testUser.sub
            })
            const result = await getTeamProgress(createdTeam.id, testUser)

            expect(result.team).toBeDefined()
            expect(result.courses).toHaveLength(1)
            expect(result.members).toHaveLength(2)
            expect(result.matrix).toBeDefined()

            // Check matrix structure
            expect(result.matrix[testUser.id]['test-course'].enrolled).toBeTruthy()
            expect(result.matrix[testUser.id]['test-course'].completed).toBeTruthy()

            expect(result.matrix[secondUser.id]['test-course'].enrolled).toBeFalsy()
            expect(result.matrix[secondUser.id]['test-course'].completed).toBeFalsy()
        }
    })

    it('should throw error for non-existent team', async () => {
        await expect(getTeamProgress('non-existent-id', testUser))
            .rejects
            .toThrow(Error)
    })

    it('should throw error for private team when user is not a member', async () => {
        // Create a private team
        const { team: createdTeam } = await createTeam(
            testUser,
            'Private Team',
            'Test Description',
            false, // not public
            true
        )

        expect(createdTeam).toBeDefined()
        expect(createdTeam?.public).toBeFalsy()

        if (createdTeam) {
            expect(getTeamProgress(createdTeam.id, secondUser))
                .rejects
                .toThrow(Error)
        }
    })

    it('should allow access to public team for non-members', async () => {
        // Create a public team
        const { team: createdTeam } = await createTeam(
            testUser,
            'Public Team',
            'Test Description',
            true, // public
            true
        )

        expect(createdTeam).toBeDefined()

        if (createdTeam) {
            const result = await getTeamProgress(createdTeam.id, secondUser)
            expect(result.team).toBeDefined()
            expect(result.members).toHaveLength(1) // only the creator
        }
    })
}) 