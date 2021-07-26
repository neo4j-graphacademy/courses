import { read } from "../../modules/neo4j";
import { formatCourse, formatUser } from "../../utils";
import { STATUS_DISABLED } from "../model/course";
import { EnrolmentsByStatus, STATUS_AVAILABLE, STATUS_COMPLETED, STATUS_ENROLLED, STATUS_INTERESTED } from "../model/enrolment";
import { User } from "../model/user";
import { courseCypher } from "./cypher";

type ValidLookupProperty = 'sub' | 'id'

export async function getUserEnrolments(sub: string, property: ValidLookupProperty = 'sub'): Promise<EnrolmentsByStatus> {

    const res = await read(`
        OPTIONAL MATCH (u:User {${property}: $sub})
        MATCH (c:Course)
        WHERE c.status <> '${STATUS_DISABLED}'

        OPTIONAL MATCH (u)-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c)

        WITH
            u,
            ${courseCypher('e', 'u', 'c')} AS course,
            CASE
                WHEN e IS NOT NULL AND e:CompletedEnrolment THEN '${STATUS_COMPLETED}'
                WHEN e IS NOT NULL THEN '${STATUS_ENROLLED}'
                WHEN ((u)-[:INTERESTED_IN]->(c)) THEN '${STATUS_INTERESTED}'
                ELSE '${STATUS_AVAILABLE}'
            END as status

        WITH u, status, collect(course) AS courses

        WITH u, collect([status, courses]) AS pairs

        RETURN u { .id, .name, .nickname, .givenName } AS user,
            apoc.map.fromPairs(pairs) AS enrolments
    `, { sub })

    if ( res.records.length === 0 ) {
        return {
            user: false,
            enrolments: [],
        } as EnrolmentsByStatus
    }

    const user: User = res.records[0].get('user')
    const enrolments = res.records[0].get('enrolments')

    // Sort items because we can't do this in a pattern comprehension
    for (const key in enrolments) {
        if (enrolments.hasOwnProperty(key)) {
            for (const course of enrolments[key]) {
                formatCourse(course)
            }
        }
    }

    return {
        user: formatUser(user),
        enrolments,
    }
}