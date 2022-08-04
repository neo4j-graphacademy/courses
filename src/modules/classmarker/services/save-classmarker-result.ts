import { UserCompletedCourse } from "../../../domain/events/UserCompletedCourse"
import { CourseWithProgress } from "../../../domain/model/course"
import { User } from "../../../domain/model/user"
import { appendParams, courseCypher } from "../../../domain/services/cypher"
import { emitter } from "../../../events"
import { write } from "../../../modules/neo4j"
import { ClassmarkerEnrolmentNotFoundError } from "../errors/classmarker-enrolment-not-found.error"

export async function saveClassmarkerResult(sub: string, first: string, last: string, classmarkerId: number, certificateSerial: string, passed: boolean, percentage: number, timeFinished: number, viewResultsUrl: string): Promise<CourseWithProgress> {
    const params = appendParams({
        sub,
        first,
        last,
        classmarkerId: classmarkerId.toString(),
        certificateSerial,
        passed,
        percentage,
        timeFinished,
        viewResultsUrl,
    })

    const res = await write(`
        MATCH (c:Course {classmarkerId: $classmarkerId})
        MERGE (u:User {sub: $sub})
        ON CREATE SET u.id = randomUuid()

        MERGE (e:Enrolment {id: apoc.text.base64Encode(c.slug +'--'+ u.sub)})
        ON CREATE SET e.createdAt = datetime(), e:FromClassMarker

        SET
            u.classmarkerFirstName = $first,
            u.classmarkerLastName = $last,
            u.displayName = coalesce(u.displayName, u.classmarkerFirstName +' '+ u.classmarkerLastName),
            e:FromCommunityGraph,
            e.updatedAt = datetime(),
            e.certificateNumber = CASE WHEN $certificateSerial <> '' THEN $certificateSerial ELSE null END,
            e.percentage = toInteger($percentage),
            e.classmarkerResultsUrl = $viewResultsUrl,
            e.attempts = coalesce(e.attempts, 0) + 1,
            e.lastSeenAt = datetime()

        MERGE (u)-[:HAS_ENROLMENT]->(e)
        MERGE (e)-[:FOR_COURSE]->(c)

        FOREACH (_ IN CASE WHEN $passed THEN [1] ELSE [] END |
            SET e:CompletedEnrolment,
                e.completedAt = datetime({epochSeconds: toInteger($timeFinished)})
        )

        FOREACH (_ IN CASE WHEN NOT $passed THEN [1] ELSE [] END |
            SET e:FailedEnrolment,
                e.failedAt = datetime({epochSeconds: toInteger($timeFinished)})
        )

        RETURN u { .* } AS user,
            ${courseCypher('e', 'u')} AS course,
            e.createdAt AS createdAt,
            e.updatedAt AS updatedAt,
            e.completedAt AS completedAt
    `, params)

    const [record] = res.records

    if (res.records.length === 0) {
        throw new ClassmarkerEnrolmentNotFoundError(
            `Could not find enrolment for ${sub} and classmarkerId: ${classmarkerId}`,
            params
        )
    }

    const user: User = record.get('user')
    const course: CourseWithProgress = record.get('course')

    if (passed) {
        emitter.emit(new UserCompletedCourse(user, course, undefined))
    }

    return course
}
