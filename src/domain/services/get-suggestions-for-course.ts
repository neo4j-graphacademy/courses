import { int } from "neo4j-driver"
import { read, readTransaction } from "../../modules/neo4j"
import { Course } from "../model/course"
import { appendParams } from "./cypher"

type CourseSuggestion = Course & { count: number }

export async function getSuggestionsForCourse(userId: string | undefined, slug: string, limit: number): Promise<CourseSuggestion[]> {

    const res = await readTransaction(async tx => {
        let current: string[] = []
        if (userId !== undefined) {
            const currentRes = await tx.run(`
                MATCH (u:User {id: $userId})-[:HAS_ENROLMENT]->(e:CompletedEnrolment)-[:FOR_COURSE]->(c)
                RETURN c.slug AS slug
            `, { userId })

            current = currentRes.records.map(row => row.get('slug') as string)
        }

        return read(`
            MATCH (c:Course {slug: $slug})<-[:FOR_COURSE]-(e1:CompletedEnrolment)<-[:HAS_ENROLMENT]-(u)-[:HAS_ENROLMENT]->(e2:CompletedEnrolment)-[:FOR_COURSE]->(c2)
            WHERE not c2:Certification  AND c2.language = c.language AND c2.status = c.status AND NOT c2.slug IN $current
            WITH c2 { .* } AS course, count(*) AS count
            RETURN course { .*, count: count }
            ORDER BY course.count DESC
            LIMIT $limit
        `, appendParams({ slug, current, limit: int(limit) }))
    })

    return res.records.map(record => record.get('course') as CourseSuggestion) as CourseSuggestion[]
}
