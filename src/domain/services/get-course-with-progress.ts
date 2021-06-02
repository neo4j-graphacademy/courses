import NotFoundError from "../../errors/not-found.error"
import { read } from "../../modules/neo4j"
import { sortCourse } from "../../utils"
import { CourseWithProgress } from "../model/course"
import { User } from "../model/user"
import { courseCypher } from "./cypher"

export async function getCourseWithProgress(slug: string, user?: User): Promise<CourseWithProgress> {
    const res = await read(`
        MATCH (c:Course {slug: $slug})
        ${user ? 'OPTIONAL MATCH (u:User {oauthId: $user})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c)' : ''}

        RETURN ${courseCypher(user ? 'e' : undefined)} AS course
    `, { slug, user: user?.user_id })

    if ( res.records.length === 0 ) {
        throw new NotFoundError(`Course ${slug} could not be found`)
    }

    const course = res.records[0].get('course') as CourseWithProgress

    sortCourse(course)

    return course
}
