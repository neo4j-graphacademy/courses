import { write } from "../../modules/neo4j";
import { User } from "../model/user";

export async function removeBookmark(course: string, user: User): Promise<boolean> {
    const res = await write(`
        MATCH (u:User {sub: $sub})-[r:INTERESTED_IN]->(c:Course {slug: $course})
        DELETE r
        RETURN true AS status
    `, { course, sub: user.sub })

    return res.records[0]?.get('status') || false as boolean
}