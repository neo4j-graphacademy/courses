import { write } from "../../modules/neo4j";
import { User } from "../model/user";

export async function registerInterest(course: string, email: string, user: User | undefined): Promise<boolean> {
    const res = await write(`
        MATCH (c:Course {slug: $course})
        SET c.interested = apoc.coll.toSet(coalesce(c.interested, []) + $email)

        FOREACH (_ IN CASE WHEN $user IS NOT NULL THEN [1] ELSE [] END |
            MERGE (u:User {id: $user})
            MERGE (u)-[r:INTERESTED_IN]->(c)
            SET r.email = $email
        )
        RETURN true AS status
    `, { course, email, user: user?.sub || null })

    return res.records[0].get('status') as boolean
}
