import { int } from "neo4j-driver"
import { read } from "../../modules/neo4j"
import { Course } from "../model/course"
import { appendParams } from "./cypher"

type CourseSuggestion = Course & { count: number }

export async function getSuggestionsForEnrolment(enrolmentId: string, limit = 3): Promise<CourseSuggestion[]> {
    const res = await read(`
        MATCH (u:User)-[:HAS_ENROLMENT]->(e:Enrolment {id: $enrolmentId})-[:FOR_COURSE]->(c)
        WITH u, e, c, [ (u)-[:HAS_ENROLMENT]->(:CompletedEnrolment)-[:FOR_COURSE]->(x) | x ] AS courses
        MATCH (c)<-[:FOR_COURSE]-()<-[:HAS_ENROLMENT]-(u2)-[:HAS_ENROLMENT]->(:CompletedEnrolment)-[:FOR_COURSE]->(c2)
        WHERE NOT c2 IN courses AND not c2:Certification  AND c2.language = c.language AND c2.status = c.status
        WITH c2 { .* } AS course, count(*) AS count
        RETURN course { .*, count: floor(count/1000)*1000 }
        ORDER BY course.count DESC
        LIMIT $limit
    `, appendParams({ enrolmentId, limit: int(limit) }))

    return res.records.map(record => record.get('course') as CourseSuggestion)
}
