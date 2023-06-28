import NotFoundError from "../../errors/not-found.error";
import { read } from "../../modules/neo4j";
import { formatCourse, formatUser } from "../../utils";
import { STATUS_ACTIVE } from "../model/course";
import { EnrolmentsByStatus, STATUS_AVAILABLE, STATUS_COMPLETED, STATUS_ENROLLED, STATUS_FAILED, STATUS_FAVORITED } from "../model/enrolment";
import { User } from "../model/user";
import { appendParams, courseCypher } from "./cypher";

type ValidLookupProperty = 'sub' | 'id'

export async function getUserEnrolments(sub: string, property: ValidLookupProperty = 'sub', throwOnNotFound = true): Promise<EnrolmentsByStatus> {
    const res = await read(`
        OPTIONAL MATCH (u:User {${property}: $sub})
        MATCH (c:Course)
        WHERE NOT c.status IN $exclude

        OPTIONAL MATCH (u)-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c)

        WITH
            u,
            ${courseCypher('e', 'u', 'c')} AS course,
            CASE
                WHEN e IS NOT NULL AND e:CompletedEnrolment THEN '${STATUS_COMPLETED}'
                WHEN e IS NOT NULL AND e:FailedEnrolment THEN '${STATUS_FAILED}'
                WHEN e IS NOT NULL THEN '${STATUS_ENROLLED}'
                WHEN ((u)-[:INTERESTED_IN]->(c)) THEN '${STATUS_FAVORITED}'
                WHEN e.status = $active THEN '${STATUS_AVAILABLE}'
                ELSE 'OTHER'
            END as status

        WITH u, status, collect(course) AS courses

        WITH u, collect([status, courses]) AS pairs

        RETURN u { .id, .name, .nickname, .givenName } AS user,
            apoc.map.fromPairs(pairs) AS enrolments
    `, appendParams({ sub, active: STATUS_ACTIVE }))

    if (res.records?.length === 0) {
        return {
            user: false,
            enrolments: {},
        }
    }

    const user: User = res.records[0].get('user')
    const enrolments = res.records[0].get('enrolments')

    if (!user) {
        if (throwOnNotFound) {
            throw new NotFoundError(`User with sub ${sub} not found`)
        }

        return {
            user: false,
            enrolments: {}
        }
    }

    // Sort items because we can't do this in a pattern comprehension
    for (const key in enrolments) {
        if (enrolments.hasOwnProperty(key)) {
            for (const course in enrolments[key]) {
                if (enrolments[key].hasOwnProperty(course)) {
                    enrolments[key][course] = await formatCourse(enrolments[key][course])
                }
            }
        }
    }

    return {
        user: formatUser(user),
        enrolments,
    }
}
