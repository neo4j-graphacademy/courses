import { write } from "../../modules/neo4j";
import { User } from "../model/user";

export async function unenrolFromCourse(course: string, user: User, token: string): Promise<void> {
    await write(`
        MATCH (u:User {sub: $sub})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c:Course {slug: $course})

        FOREACH ( a IN [ (e)-[:HAS_ATTEMPT]->(a) | a ] |
            FOREACH ( an IN [(a)-[:PROVIDED_ANSWER]->(an) | an] |
                DETACH DELETE an
            )
            DETACH DELETE a
        )

        DETACH DELETE e

        RETURN distinct true
    `, {
        sub: user.sub,
        course,
    })
}