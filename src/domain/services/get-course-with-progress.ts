import NotFoundError from "../../errors/not-found.error"
import { read } from "../../modules/neo4j"
import { CourseWithProgress } from "../model/course"
import { User } from "../model/user"

export async function getCourseWithProgress(slug: string, user?: User): Promise<CourseWithProgress> {
    const res = await read(`
        MATCH (c:Course {slug: $slug})

        ${user ? 'OPTIONAL MATCH (u:User {id: $user})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c)' : ''}

        RETURN c {
            .slug,
            .title,
            .thumbnail,
            .caption,
            .status,
            .usecase,
            link: '/courses/'+ c.slug,

            ${user ? 'enrolled: e IS NOT NULL,' : ''}

            modules: [ (c)-[:HAS_MODULE]->(m) | m {
                .*,
                link: '/courses/'+ c.slug +'/'+ m.slug,
                next: [ (m)-[:FIRST_LESSON]->(next) |
                    next { .slug, .title, link: '/courses/'+ c.slug + '/'+ m.slug +'/'+ next.slug }
                ][0],
                lessons: [ (m)-[:HAS_LESSON]->(l) | l {
                    .*,
                    ${user ? 'completed: exists((e)-[:COMPLETED_LESSON]->(l)),' : ''}
                    link: '/courses/'+ c.slug +'/'+ m.slug +'/'+ l.slug,
                    previous: [ (l)<-[:NEXT_LESSON]-(prev)<-[:HAS_LESSON]-(pm) | prev { .slug, .title, link: '/courses/'+ c.slug + '/'+ pm.slug +'/'+ prev.slug} ][0],
                    next: [ (l)-[:NEXT_LESSON]->(next)<-[:HAS_LESSON]-(nm) | next { .slug, .title, link: '/courses/'+ c.slug + '/'+ nm.slug +'/'+ next.slug } ][0],
                    questions: [(l)-[:HAS_QUESTION]->(q) | q { .id, .slug }]
                } ]
            } ]
        } AS course
    `, { slug, user: user?.user_id })

    if ( res.records.length === 0 ) {
        throw new NotFoundError(`Course ${slug} could not be found`)
    }

    const course = <CourseWithProgress> res.records[0].get('course')

    // Sort items because we can't do this in a pattern comprehension
    course.modules.map(module => {
        module.lessons.sort((a, b) => a.order < b.order ? -1 : 1)
    })
    course.modules.sort((a, b) => a.order < b.order ? -1 : 1)

    return course
}
