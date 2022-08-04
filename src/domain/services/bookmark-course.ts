import { write } from "../../modules/neo4j";
import { User } from "../model/user";

export async function bookmarkCourse(course: string, user: User): Promise<boolean> {
    const res = await write(`
        MATCH (c:Course {slug: $course})
        MERGE (u:User {sub: $sub})
        SET u.email = coalesce($email, u.email)

        MERGE (u)-[r:INTERESTED_IN]->(c)
        SET r.createdAt = datetime()
        RETURN true AS status
    `, { course, sub: user.sub, email: user.email })

    return res.records[0]?.get('status') as boolean || false
}
