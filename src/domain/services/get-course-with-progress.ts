import NotFoundError from "../../errors/not-found.error"
import { readTransaction } from "../../modules/neo4j"
import databaseProvider from "../../modules/instances"
import { mergeCourseAndEnrolment } from "../../utils"
import { CourseWithProgress } from "../model/course"
import { User } from "../model/user"
import getCourses from "./get-courses"
import getEnrolment from "./enrolments/get-enrolment"
import { notifyPossibleRequestError } from "../../middleware/bugsnag.middleware"

export async function getCourseWithProgress(slug: string, user?: User, token?: string): Promise<CourseWithProgress> {
    const course = await readTransaction<CourseWithProgress>(async tx => {
        let course = (await getCourses(tx)).find(course => course.slug === slug)

        if (course && user) {
            const enrolments = await getEnrolment(tx, user, 'sub', slug)

            if (enrolments.length) {
                course = await mergeCourseAndEnrolment(course, enrolments[0])
            }
        }
        return course
    })

    if (!course) {
        throw new NotFoundError(`Course ${slug} could not be found`)
    }

    // Attempt to find a Sandbox instance
    try {
        if (user && token && course.usecase) {
            const provider = databaseProvider(course.databaseProvider)
            course.sandbox = await provider.getOrCreateInstanceForUseCase(token, user, course.usecase, course.vectorOptimized, course.graphAnalyticsPlugin)
        }
    }
    catch (e) {
        // Should be fine
        notifyPossibleRequestError(e, user)
    }

    return course
}
