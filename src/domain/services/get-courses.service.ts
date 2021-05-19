import { read } from "../../modules/neo4j";
import { Course, STATUS_DISABLED } from "../model/course";

export async function getCourses(): Promise<Course[]> {
    console.warn('Deprecated - use getCoursesByCategory');

    const res = await read(`
        MATCH (c:Course)
        WHERE c.status <> $disabled
        RETURN c {
            .slug,
            .title,
            .thumbnail,
            .caption,
            .status,
            .usecase,
            link: '/courses/'+ c.slug,
            modules: [ (c)-[:HAS_MODULE]->(m) | m {
                .*,
                link: '/courses/'+ c.slug +'/'+ m.slug,
                lessons: [ (m)-[:HAS_LESSON]->(l) | l {
                    .*,
                    link: '/courses/'+ c.slug +'/'+ m.slug +'/'+ l.slug,
                    previous: [ (l)<-[:NEXT_LESSON]-(prev)<-[:HAS_LESSON]-(pm) | prev { .slug, .title, link: '/courses/'+ c.slug + '/'+ pm.slug +'/'+ prev.slug} ][0],
                    next: [ (l)-[:NEXT_LESSON]->(next)<-[:HAS_LESSON]-(nm) | next { .slug, .title, link: '/courses/'+ c.slug + '/'+ nm.slug +'/'+ next.slug } ][0]
                } ]
            } ]
        } AS course
    `, { disabled: STATUS_DISABLED })

    return res.records.map(row => row.get('course'))
}