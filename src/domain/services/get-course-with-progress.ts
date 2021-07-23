import NotFoundError from "../../errors/not-found.error"
import { read } from "../../modules/neo4j"
import { formatCourse } from "../../utils"
import { CourseWithProgress } from "../model/course"
import { User } from "../model/user"
import { courseCypher } from "./cypher"

export async function getCourseWithProgress(slug: string, user?: User): Promise<CourseWithProgress> {
    const res = await read(`
        MATCH (c:Course {slug: $slug})
        ${user ? 'OPTIONAL MATCH (u:User {sub: $sub}) OPTIONAL MATCH (u)-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c)' : ''}

        RETURN ${courseCypher(user ? 'e' : undefined, user ? 'u' : undefined)} AS course
    `, { slug, sub: user?.sub })

    if ( res.records.length === 0 ) {
        throw new NotFoundError(`Course ${slug} could not be found`)
    }

    const course = formatCourse(res.records[0].get('course')) as CourseWithProgress

    return course
}
