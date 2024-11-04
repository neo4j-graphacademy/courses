import initNeo4j, { read, write, close } from '../../../modules/neo4j'
import { User } from '../../model/user'
import updateTeam from './update-team'
import createTeam from './create-team'
import { config } from 'dotenv'
import NotFoundError from '../../../errors/not-found.error'
import UnauthorizedError from '../../../errors/unauthorized.error'
import { MembershipRole } from '../../model/team'

describe('updateTeam', () => {
    beforeAll(async () => {
        config()
        await initNeo4j(process.env.NEO4J_HOST as string, process.env.NEO4J_USERNAME as string, process.env.NEO4J_PASSWORD as string)
    })

    afterAll(async () => {
        await close()
    })

    const adminUser = {
        sub: 'admin-user-id',
        email: 'admin@example.com',
        givenName: 'Admin User'
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
            sub1: adminUser.sub,
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
            sub1: adminUser.sub,
            email1: adminUser.email,
            givenName1: adminUser.givenName,
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
            sub1: adminUser.sub,
            sub2: memberUser.sub
        })
    })

    it('should successfully update team as admin', async () => {
        // Create a team
        const { team: createdTeam } = await createTeam(
            adminUser,
            'Original Name',
            'Original Description',
            false,
            true
        )

        expect(createdTeam).toBeDefined()

        if (createdTeam) {
            const updates = {
                name: 'Updated Name',
                description: 'Updated Description',
                isPublic: true,
                isOpen: false
            }

            const result = await updateTeam(createdTeam.id, adminUser, updates)

            expect(result.errors).toBeUndefined()
            expect(result.team).toBeDefined()
            expect(result.team).toEqual(expect.objectContaining({
                name: updates.name,
                description: updates.description,
                public: updates.isPublic,
                open: updates.isOpen,
                isAdmin: true,
                isMember: true,
                role: MembershipRole.ADMIN,
            }))
        }
    })

    it('should fail validation with empty required fields', async () => {
        const { team: createdTeam } = await createTeam(
            adminUser,
            'Test Team',
            'Test Description',
            true,
            true
        )

        expect(createdTeam).toBeDefined()

        if (createdTeam) {
            const updates = {
                name: '',
                description: '',
                isPublic: true,
                isOpen: true
            }

            const result = await updateTeam(createdTeam.id, adminUser, updates)

            expect(result.errors).toBeDefined()
            expect(result.errors?.name).toBe('Team name is required')
            expect(result.errors?.description).toBe('Team description is required')
            expect(result.team).toBeUndefined()
        }
    })

    it('should throw UnauthorizedError for non-admin member', async () => {
        // Create a team
        const { team: createdTeam } = await createTeam(
            adminUser,
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
                CREATE (u)-[:MEMBER_OF {role: 'member'}]->(t)
            `, {
                sub: memberUser.sub,
                teamId: createdTeam.id
            })

            const updates = {
                name: 'Updated Name',
                description: 'Updated Description',
                isPublic: true,
                isOpen: true
            }

            await expect(updateTeam(createdTeam.id, memberUser, updates))
                .rejects
                .toThrow(Error)
        }
    })

    it('should throw NotFoundError for non-existent team', async () => {
        const updates = {
            name: 'Updated Name',
            description: 'Updated Description',
            isPublic: true,
            isOpen: true
        }

        await expect(updateTeam('non-existent-id', adminUser, updates))
            .rejects
            .toThrow(Error)
    })
}) 