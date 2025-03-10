import NotFoundError from "../../errors/not-found.error";
import { readTransaction } from "../../modules/neo4j";
import { formatUser, mergeCourseAndEnrolment } from "../../utils";
import { EnrolmentsByStatus, STATUS_COMPLETED, STATUS_RECENTLY_COMPLETED } from "../model/enrolment";
import { User, ValidLookupProperty } from "../model/user";
import getEnrolments from "./enrolments/get-enrolment";
import getActivePaths from "./enrolments/get-active-paths";
import getCourses from "./get-courses";

export async function getUserEnrolments(sub: string, property: ValidLookupProperty = 'sub', courseSlug: string | undefined = undefined, throwOnNotFound = true): Promise<EnrolmentsByStatus> {
    const { user, enrolments, paths, } = await readTransaction(async tx => {
        const ures = await tx.run(`
            MATCH (u:User {\`${property}\`: $sub }) RETURN u {.*} AS user
        `, { property, sub })

        const user = ures.records[0]?.get('user') as User | undefined

        const courses = await getCourses(tx)
        const enrolments = await getEnrolments(tx, { [property]: sub } as Partial<User>, property, courseSlug)
        const activePaths = await getActivePaths(tx, { [property]: sub } as Partial<User>)

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

            // Recently completed
            if (course && enrolment.recentlyCompleted) {
                if (!byStatus[STATUS_RECENTLY_COMPLETED]) {
                    byStatus[STATUS_RECENTLY_COMPLETED] = []
                }

                byStatus[STATUS_RECENTLY_COMPLETED].push(await mergeCourseAndEnrolment(course, enrolment))
            }
        }

        // Get enrolment status for each course in activePaths
        const paths = await Promise.all(activePaths.map(async path => {
            return {
                ...path,
                courses: await Promise.all((path.courses ?? []).map(async course => {
                    const enrolment = enrolments.find(enrolment => enrolment.courseSlug === course.slug)

                    if (!enrolment) {
                        return course
                    }

                    return mergeCourseAndEnrolment(course, enrolment)
                })) ?? []
            }
        }))

        return {
            user,
            enrolments: byStatus,
            paths: paths.map(path => {
                const completed = path.courses.filter(course => course.status === STATUS_COMPLETED)
                const total = path.courses.length

                return {
                    ...path,
                    completedCount: completed.length,
                    completedPercentage: (completed.length / total) * 100,
                }
            }),
        }
    })

    if (!user) {
        if (throwOnNotFound) {
            throw new NotFoundError(`User with sub ${sub} not found`)
        }

        return {
            user: false,
            enrolments: {},
            paths: [],
        }
    }

    return {
        user: formatUser(user),
        enrolments,
        paths,
    }
}
