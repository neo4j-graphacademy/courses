import initNeo4j, { read, write, close } from '../../../modules/neo4j'
import { User } from '../../model/user'
import createTeam from './create-team'
import joinTeam from './join-team'
import leaveTeam from './leave-team'
import updateTeam from './update-team'
import getTeam from './get-team'
import { getTeamProgress } from './get-team-progress'
import { config } from 'dotenv'
import { emitter } from '../../../events'
import { UserJoinedTeam } from '../../events/UserJoinedTeam'

// Mock the emitter
jest.mock('../../../events', () => ({
    emitter: {
        emit: jest.fn()
    }
}))

describe('Team Lifecycle', () => {
    beforeAll(async () => {
        config()
        await initNeo4j(process.env.NEO4J_HOST as string, process.env.NEO4J_USERNAME as string, process.env.NEO4J_PASSWORD as string)
    })

    afterAll(async () => {
        await close()
    })

    const owner = {
        sub: 'owner-id',
        email: 'owner@example.com',
        givenName: 'Team Owner'
    } as User

    const member1 = {
        sub: 'member1-id',
        email: 'member1@example.com',
        givenName: 'Member One'
    } as User

    const member2 = {
        sub: 'member2-id',
        email: 'member2@example.com',
        givenName: 'Member Two'
    } as User

    const nonMember = {
        sub: 'non-member-id',
        email: 'nonmember@example.com',
        givenName: 'Non Member'
    } as User

    // Clean up test data before test
    beforeEach(async () => {
        await write(`
            MATCH (u:User)
            WHERE u.sub IN [$ownerSub, $member1Sub, $member2Sub, $nonMemberSub]
            OPTIONAL MATCH (u)-[r]->(t:Team)
            DETACH DELETE u, t
        `, {
            ownerSub: owner.sub,
            member1Sub: member1.sub,
            member2Sub: member2.sub,
            nonMemberSub: nonMember.sub
        })

        jest.clearAllMocks()
    })

    describe('Public Teams', () => {
        it('should handle complete team lifecycle', async () => {
            // Step 1: Create a public team
            const { team: createdTeam } = await createTeam(
                owner,
                'Public Team',
                'Public Description',
                true,  // public
                true   // open
            )

            expect(createdTeam).toBeDefined()
            expect(createdTeam?.name).toBe('Public Team')
            expect(createdTeam?.description).toBe('Public Description')
            expect(createdTeam?.public).toBe(true)
            expect(createdTeam?.open).toBe(true)

            // Step 2: Member1 joins the team
            const joinResult1 = await joinTeam(member1, createdTeam!.id)
            expect(joinResult1.error).toBeUndefined()
            expect(joinResult1.team).toBeDefined()
            expect(emitter.emit).toHaveBeenCalledWith(expect.any(UserJoinedTeam))

            // Step 3: Member2 joins the team
            const joinResult2 = await joinTeam(member2, createdTeam!.id)
            expect(joinResult2.error).toBeUndefined()
            expect(joinResult2.team).toBeDefined()

            // Step 4: Verify team members
            const teamProgress = await getTeamProgress(createdTeam!.id, owner)
            expect(teamProgress).toBeDefined()
            expect(teamProgress.members).toBeDefined()
            expect(teamProgress.members).toHaveLength(3) // owner + 2 members
            expect(teamProgress.members.map(m => m.sub)).toContain(owner.sub)
            expect(teamProgress.members.map(m => m.sub)).toContain(member1.sub)
            expect(teamProgress.members.map(m => m.sub)).toContain(member2.sub)

            // Step 5: Update team details
            const updatedTeam = await updateTeam(createdTeam!.id, owner, {
                name: 'Updated Public Team',
                description: 'Updated Public Description',
                isPublic: true,
                isOpen: true
            })
            expect(updatedTeam).toBeDefined()
            expect(updatedTeam?.team?.name).toBe('Updated Public Team')
            expect(updatedTeam?.team?.description).toBe('Updated Public Description')
            expect(updatedTeam?.team?.public).toBe(true)
            expect(updatedTeam?.team?.open).toBe(true)

            // Step 6: Member1 leaves the team
            const leaveResult = await leaveTeam(member1, createdTeam!.id)
            expect(leaveResult).toBeDefined()

            // Step 7: Verify team members after member1 leaves
            const finalTeamProgress = await getTeamProgress(createdTeam!.id, owner)
            expect(finalTeamProgress).toBeDefined()
            expect(finalTeamProgress.members).toBeDefined()
            expect(finalTeamProgress.members).toHaveLength(2) // owner + member2
            expect(finalTeamProgress.members.map(m => m.sub)).toContain(owner.sub)
            expect(finalTeamProgress.members.map(m => m.sub)).toContain(member2.sub)
            expect(finalTeamProgress.members.map(m => m.sub)).not.toContain(member1.sub)
        })

        it('should allow non-members to view public team information', async () => {
            // Create a public team
            const { team: createdTeam } = await createTeam(
                owner,
                'Public Team',
                'Public Description',
                true,  // public
                true   // open
            )

            expect(createdTeam).toBeDefined()

            // Verify non-member can see team details
            const teamInfo = await getTeam(createdTeam!.id, nonMember)
            expect(teamInfo.team).toBeDefined()
            expect(teamInfo.team?.name).toBe('Public Team')
            expect(teamInfo.team?.description).toBe('Public Description')
            expect(teamInfo.team?.public).toBe(true)
            expect(teamInfo.team?.open).toBe(true)
            expect(teamInfo.membership?.isMember).toBe(false)
            expect(teamInfo.membership?.isAdmin).toBe(false)
        })
    })

    describe('Private Teams', () => {
        it('should handle complete team lifecycle', async () => {
            // Step 1: Create a private team
            const { team: createdTeam } = await createTeam(
                owner,
                'Private Team',
                'Private Description',
                false, // private
                true   // open
            )

            expect(createdTeam).toBeDefined()
            expect(createdTeam?.name).toBe('Private Team')
            expect(createdTeam?.description).toBe('Private Description')
            expect(createdTeam?.public).toBe(false)
            expect(createdTeam?.open).toBe(true)
            expect(createdTeam?.pin).toBeDefined()

            // Step 2: Member1 joins the team with correct PIN
            const joinResult1 = await joinTeam(member1, createdTeam!.id, createdTeam!.pin)
            expect(joinResult1.error).toBeUndefined()
            expect(joinResult1.team).toBeDefined()
            expect(emitter.emit).toHaveBeenCalledWith(expect.any(UserJoinedTeam))

            // Step 3: Member2 joins the team with correct PIN
            const joinResult2 = await joinTeam(member2, createdTeam!.id, createdTeam!.pin)
            expect(joinResult2.error).toBeUndefined()
            expect(joinResult2.team).toBeDefined()

            // Step 4: Verify team members
            const teamProgress = await getTeamProgress(createdTeam!.id, owner)
            expect(teamProgress).toBeDefined()
            expect(teamProgress.members).toBeDefined()
            expect(teamProgress.members).toHaveLength(3) // owner + 2 members
            expect(teamProgress.members.map(m => m.sub)).toContain(owner.sub)
            expect(teamProgress.members.map(m => m.sub)).toContain(member1.sub)
            expect(teamProgress.members.map(m => m.sub)).toContain(member2.sub)

            // Step 5: Update team details
            const updatedTeam = await updateTeam(createdTeam!.id, owner, {
                name: 'Updated Private Team',
                description: 'Updated Private Description',
                isPublic: false,
                isOpen: true
            })
            expect(updatedTeam).toBeDefined()
            expect(updatedTeam?.team?.name).toBe('Updated Private Team')
            expect(updatedTeam?.team?.description).toBe('Updated Private Description')
            expect(updatedTeam?.team?.public).toBe(false)
            expect(updatedTeam?.team?.open).toBe(true)

            // Step 6: Member1 leaves the team
            const leaveResult = await leaveTeam(member1, createdTeam!.id)
            expect(leaveResult).toBeDefined()

            // Step 7: Verify team members after member1 leaves
            const finalTeamProgress = await getTeamProgress(createdTeam!.id, owner)
            expect(finalTeamProgress).toBeDefined()
            expect(finalTeamProgress.members).toBeDefined()
            expect(finalTeamProgress.members).toHaveLength(2) // owner + member2
            expect(finalTeamProgress.members.map(m => m.sub)).toContain(owner.sub)
            expect(finalTeamProgress.members.map(m => m.sub)).toContain(member2.sub)
            expect(finalTeamProgress.members.map(m => m.sub)).not.toContain(member1.sub)
        })

        it('should prevent non-members from accessing private team information', async () => {
            // Create a private team
            const { team: createdTeam } = await createTeam(
                owner,
                'Private Team',
                'Private Description',
                false, // private
                false  // closed
            )

            expect(createdTeam).toBeDefined()

            // Verify non-member cannot join without PIN
            const joinAttempt = await joinTeam(nonMember, createdTeam!.id)
            expect(joinAttempt.error).toBeDefined()
            expect(joinAttempt.team).toBeUndefined()

            // Verify non-member cannot join with incorrect PIN
            const joinAttemptWithPin = await joinTeam(nonMember, createdTeam!.id, 'incorrect-pin')
            expect(joinAttemptWithPin.error).toBeDefined()
            expect(joinAttemptWithPin.team).toBeUndefined()

            // Verify non-member cannot see team details
            const teamInfo = await getTeam(createdTeam!.id, nonMember)
            expect(teamInfo.team).toBeDefined() // Team exists but membership is restricted
            expect(teamInfo.membership?.isMember).toBe(false)
            expect(teamInfo.membership?.isAdmin).toBe(false)

            // Verify non-member cannot update team
            await expect(updateTeam(createdTeam!.id, nonMember, {
                name: 'Hacked Team',
                description: 'Hacked Description',
                isPublic: true,
                isOpen: true
            })).rejects.toThrow(createdTeam!.id)

            // Verify non-member cannot leave team they're not in
            const leaveAttempt = await leaveTeam(nonMember, createdTeam!.id)
            expect(leaveAttempt).toBeUndefined()
        })
    })
}) 