import NotFoundError from "../../errors/not-found.error";
import { readTransaction } from "../../modules/neo4j";
import { formatUser, mergeCourseAndEnrolment } from "../../utils";
import { EnrolmentsByStatus } from "../model/enrolment";
import { User, ValidLookupProperty } from "../model/user";
import getEnrolments from "./enrolments/get-enrolment";
import getCourses from "./get-courses";

export async function getUserEnrolments(sub: string, property: ValidLookupProperty = 'sub', courseSlug: string | undefined = undefined, throwOnNotFound = true): Promise<EnrolmentsByStatus> {
    const { user, enrolments } = await readTransaction(async tx => {
        const ures = await tx.run(`
            MATCH (u:User {\`${property}\`: $sub }) RETURN u {.*} AS user
        `, { property, sub })

        const user = ures.records[0]?.get('user') as User | undefined

        const courses = await getCourses(tx)
        const enrolments = await getEnrolments(tx, { [property]: sub } as Partial<User>, property, courseSlug)

        const byStatus = {}

        for (const enrolment of enrolments) {
            const status = enrolment.status

            if (!byStatus[status]) {
                byStatus[status] = []
            }

            const course = courses.find(course => course.slug == enrolment.courseSlug)

            if (course && course.certification === false) {
                byStatus[status].push(await mergeCourseAndEnrolment(course, enrolment))
            }
        }

        return {
            user,
            enrolments: byStatus,
        }
    })

    if (!user) {
        if (throwOnNotFound) {
            throw new NotFoundError(`User with sub ${sub} not found`)
        }

        return {
            user: false,
            enrolments: {}
        }
    }

    return {
        user: formatUser(user),
        enrolments,
    }
}
