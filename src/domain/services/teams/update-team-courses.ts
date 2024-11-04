import UnauthorizedError from "../../../errors/unauthorized.error";
import { writeTransaction } from "../../../modules/neo4j";
import { User } from "../../model/user";
import getUserMembership from "./get-user-membership";

export default async function updateTeamCourses(teamId: string, user: User, courses: Record<string, string>) {
    return writeTransaction(async tx => {
        // Check if user is admin
        const membership = await getUserMembership(tx, user.sub, teamId)
        if (!membership?.isAdmin) {
            throw new UnauthorizedError('Unauthorized')
        }

        // Delete all existing course relationships
        await tx.run(`
            MATCH (t:Team {id: $teamId})-[r:ON_LEARNING_PATH_FOR]-()
            DELETE r
        `, { teamId })

        // Create new relationships with order
        const courseEntries = Object.entries(courses)
            .filter(([_, order]) => order) // Remove empty selections
            .map(([slug, order]) => ({
                slug,
                order: parseInt(order as string)
            }))
            .sort((a, b) => a.order - b.order)
            .map(({ slug, }, index) => ({ slug, order: index + 1 }))

        if (courseEntries.length > 0) {
            await tx.run(`
                MATCH (t:Team {id: $teamId})

                UNWIND $courseEntries AS entry

                MATCH (c:Course {slug: entry.slug})
                CREATE (c)-[r:ON_LEARNING_PATH_FOR]->(t)
                SET r.order = entry.order
            `, {
                teamId,
                courseEntries,
            })
        }
    })
} 