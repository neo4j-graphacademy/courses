import { read } from "../../modules/neo4j";
import { Course, STATUS_DISABLED } from "../model/course";
import { lessonCypher } from "./cypher";

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
                lessons: [ (m)-[:HAS_LESSON]->(l) | ${lessonCypher()} ]
            } ]
        } AS course
    `, { disabled: STATUS_DISABLED })

    return res.records.map(row => row.get('course'))
}