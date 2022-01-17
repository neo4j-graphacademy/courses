import { emitter } from "../../events";
import { write } from "../../modules/neo4j";
import { UserUnenrolled } from "../events/UserUnenrolled";
import { Course } from "../model/course";
import { User } from "../model/user";

export async function unenrolFromCourse(course: string, user: User, token: string): Promise<void> {
    const res = await write(`
        MATCH (u:User {sub: $sub})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c:Course {slug: $course})

        FOREACH ( a IN [ (e)-[:HAS_ATTEMPT]->(a) | a ] |
            FOREACH ( an IN [(a)-[:PROVIDED_ANSWER]->(an) | an] |
                DETACH DELETE an
            )
            DETACH DELETE a
        )

        DETACH DELETE e

        RETURN c {
            .*,
            categories: [ (c)-[:IN_CATEGORY]->(x) | x { .slug, .title } ]
        } AS course
    `, {
        sub: user.sub,
        course,
    })

    const [ first ] = res.records

    if ( first ) {
        const courseInfo: Course = first.get('course')
        emitter.emit( new UserUnenrolled(user, courseInfo) )
    }
}
