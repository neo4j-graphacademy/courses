import { writeTransaction } from '../../../modules/neo4j';
import NotFoundError from '../../../errors/not-found.error';
import { TeamWithMembership } from '../../model/team';
import { User } from '../../model/user';
import { MembershipRole } from '../../model/team';

interface TeamUpdateInput {
    name: string;
    description: string;
    isPublic: boolean;
    isOpen: boolean;
}

export default async function updateTeam(
    id: string,
    user: User,
    updates: TeamUpdateInput
): Promise<{ errors?: Record<string, string>, team?: TeamWithMembership }> {
    // Validate required fields
    const errors: Record<string, string> = {};
    if (!updates.name?.trim()) errors.name = 'Team name is required';
    if (!updates.description?.trim()) errors.description = 'Team description is required';
    if (Object.keys(errors).length > 0) return { errors };

    // Check user membership and admin status first
    return writeTransaction<{ team: TeamWithMembership }>(async (tx) => {
        const result = await tx.run(`
            MATCH (t:Team {id: $id})
            MATCH (u:User {sub: $sub})-[r:MEMBER_OF]->(t)
            WHERE r.role = $adminRole
            SET t.name = $name,
                t.description = $description,
                t.public = $public,
                t.open = $open,
                t.updatedAt = datetime()
            RETURN t {
              .*,
              link: '/teams/' + t.id + '/',
              isAdmin: true,
              isMember: true,
              role: r.role
            } AS team
        `, {
            id,
            sub: user.sub,
            adminRole: MembershipRole.ADMIN,
            name: updates.name.trim(),
            description: updates.description.trim(),
            public: updates.isPublic,
            open: updates.isOpen
        });


        if (result.records.length === 0) {
            throw new NotFoundError(`Team with ID ${id} not found`);
        }

        return result.records[0].toObject()
    });
} 
