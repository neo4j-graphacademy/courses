import initNeo4j, { readTransaction, write, close } from '../../../modules/neo4j'
import { User } from '../../model/user'
import getUserMembership from './get-user-membership'
import createTeam from './create-team'
import { config } from 'dotenv'
import { MembershipRole } from '../../model/team'

describe('getUserMembership', () => {
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

    const secondUser = {
        sub: 'second-user-id',
        email: 'second@example.com',
        givenName: 'Second User'
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
            sub2: secondUser.sub
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
            sub2: secondUser.sub,
            email2: secondUser.email,
            givenName2: secondUser.givenName
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
            sub2: secondUser.sub
        })
    })

    it('should return admin membership status for team creator', async () => {
        // Create a team (creator is automatically admin)
        const { team: createdTeam } = await createTeam(
            testUser,
            'Test Team',
            'Test Description',
            true,
            true
        )

        expect(createdTeam).toBeDefined()

        if (createdTeam) {
            const result = await readTransaction(async (tx) => {
                return await getUserMembership(tx, testUser.sub, createdTeam.id)
            })

            expect(result).toEqual({
                isMember: true,
                isAdmin: true,
                role: MembershipRole.ADMIN
            })
        }
    })

    it('should return regular member status for team member', async () => {
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
            // Add second user as regular member
            await write(`
                MATCH (u:User {sub: $sub}), (t:Team {id: $teamId})
                CREATE (u)-[:MEMBER_OF {role: 'member'}]->(t)
            `, {
                sub: secondUser.sub,
                teamId: createdTeam.id
            })

            const result = await readTransaction(async (tx) => {
                return await getUserMembership(tx, secondUser.sub, createdTeam.id)
            })

            expect(result).toEqual({
                isMember: true,
                isAdmin: false,
                role: 'member'
            })
        }
    })

    it('should return non-member status for non-member user', async () => {
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
            const result = await readTransaction(async (tx) => {
                return await getUserMembership(tx, 'non-member-user-id', createdTeam.id)
            })

            expect(result).toEqual({
                isMember: false,
                isAdmin: false,
                role: null
            })
        }
    })
}) 