import NotFoundError from "../../errors/not-found.error"
import { read } from "../../modules/neo4j"
import { getSandboxForUseCase } from "../../modules/sandbox"
import { formatCourse } from "../../utils"
import { CourseWithProgress } from "../model/course"
import { User } from "../model/user"
import { appendParams, courseCypher } from "./cypher"

export async function getCourseWithProgress(slug: string, user?: User, token?: string): Promise<CourseWithProgress> {
    const res = await read(`
        MATCH (c:Course {slug: $slug})
        ${user ? 'OPTIONAL MATCH (u:User {sub: $sub}) OPTIONAL MATCH (u)-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c)' : ''}

        RETURN ${courseCypher(user ? 'e' : undefined, user ? 'u' : undefined)} AS course
    `, appendParams({ slug, sub: user?.sub}))

    if ( res.records.length === 0 ) {
        throw new NotFoundError(`Course ${slug} could not be found`)
    }

    const course = formatCourse(res.records[0].get('course')) as CourseWithProgress

    // Attempt to find a Sandbox instance
    try {
        if (token && course.usecase) {
            course.sandbox = await getSandboxForUseCase(token, course.usecase)
        }
    }
    catch(e) {
    }

    return course
}
