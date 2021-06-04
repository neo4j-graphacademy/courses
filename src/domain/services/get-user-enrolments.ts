import { read } from "../../modules/neo4j";
import { sortCourse } from "../../utils";
import { EnrolmentsByStatus, STATUS_AVAILABLE, STATUS_COMPLETED, STATUS_ENROLLED } from "../model/enrolment";
import { courseCypher } from "./cypher";

export async function getUserEnrolments(id: string): Promise<EnrolmentsByStatus> {

    const res = await read(`
        MATCH (u:User {id: $id})
        MATCH (c:Course)

        OPTIONAL MATCH (u)-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c)

        WITH
            u { .id, .name, .givenName } AS user,

            ${courseCypher('e')} AS course,
            CASE WHEN e IS NULL THEN '${STATUS_AVAILABLE}'
                 WHEN e:CompletedEnrolment THEN '${STATUS_COMPLETED}'
                 ELSE '${STATUS_ENROLLED}'
            END as status

        WITH user, status, collect(course) AS courses

        WITH user, collect([status, courses]) AS pairs

        RETURN user, apoc.map.fromPairs(pairs) AS enrolments
    `, { id })

    if ( res.records.length === 0 ) {
        return {} as EnrolmentsByStatus
    }

    const user = res.records[0].get('user')
    const enrolments = res.records[0].get('enrolments')

    // Sort items because we can't do this in a pattern comprehension
    for (const key in enrolments) {
        if (enrolments.hasOwnProperty(key)) {
            for (const course of enrolments[key]) {
                sortCourse(course)
            }
        }
    }

    return {
        user,
        enrolments,
    }

}