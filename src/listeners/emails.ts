import { UserCompletedCourse } from '../domain/events/UserCompletedCourse'
import { UserEnrolled } from '../domain/events/UserEnrolled'
import { getSuggestionsForEnrolment } from '../domain/services/get-suggestions-for-enrolment'
import { emitter } from '../events'
import { isEnabled, prepareAndSend } from '../modules/mailer'

export default function initEmailListeners(): Promise<void> {
    if (isEnabled()) {
        emitter.on<UserEnrolled>(UserEnrolled, event => {
            if (event.user.unsubscribed) {
                return
            }

            const email = event.user.email

            const template = 'user-enrolled'
            const emailDirectory = event.course.emails?.includes(template) ? `courses/${event.course.slug}/` : ''

            if (!event.course.certification) {
                prepareAndSend(template, email, { ...event }, emailDirectory, template)
            }
        })

        emitter.on<UserCompletedCourse>(UserCompletedCourse, async event => {
            if (event.user.unsubscribed) {
                return
            }

            const template = 'user-completed-course'
            const email = event.user.email

            const emailDirectory = event.course.emails?.includes(template) ? `courses/${event.course.slug}/` : ''

            // Get Course Recommendations
            const suggestions = await getSuggestionsForEnrolment(event.course.enrolmentId)

            let suggestion2, suggestion3, somethingDifferent

            const [suggestion1] = suggestions

            if (suggestions.length > 1) {
                somethingDifferent = suggestions[suggestions.length - 1]
            }
            if (suggestions.length > 2) {
                suggestion2 = suggestions[1]

            }
            if (suggestions.length > 3) {
                suggestion2 = suggestions[2]
            }

            prepareAndSend(template, email, { ...event, suggestion1, suggestion2, suggestion3, somethingDifferent } as Record<string, any>, emailDirectory, template)
        })
    }

    return Promise.resolve()
}
