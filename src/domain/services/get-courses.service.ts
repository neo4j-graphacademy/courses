import { read } from "../../modules/neo4j";
import { Course, STATUS_DISABLED } from "../model/course";
import { courseCypher, lessonCypher } from "./cypher";

export async function getCourses(): Promise<Course[]> {
    console.warn('Deprecated - use getCoursesByCategory');

    const res = await read(`
        MATCH (c:Course)
        WHERE c.status <> $disabled
        RETURN ${courseCypher()} AS course
    `, { disabled: STATUS_DISABLED })

    return res.records.map(row => row.get('course'))
}