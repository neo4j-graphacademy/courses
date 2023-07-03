import NotFoundError from "../../errors/not-found.error"
import { readTransaction } from "../../modules/neo4j"
import { getSandboxForUseCase } from "../../modules/sandbox"
import { mergeCourseAndEnrolment } from "../../utils"
import { CourseWithProgress } from "../model/course"
import { User } from "../model/user"
import getCourses from "./get-courses"
import getEnrolment from "./enrolments/get-enrolment"

export async function getCourseWithProgress(slug: string, user?: User, token?: string): Promise<CourseWithProgress> {
    const course = await readTransaction<CourseWithProgress>(async tx => {
        let course = (await getCourses(tx)).find(course => course.slug === slug)

        if (course && user) {
            const enrolments = await getEnrolment(tx, user, slug)

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
            course.sandbox = await getSandboxForUseCase(token, user, course.usecase)
        }
    }
    catch (e) {
        // Should be fine
    }

    return course
}
