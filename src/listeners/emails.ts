import { UserCompletedCourse } from '../domain/events/UserCompletedCourse'
import { UserEnrolled } from '../domain/events/UserEnrolled'
import { emitter } from '../events'
import { isEnabled, prepareAndSend } from '../modules/mailer'

export default function initEmailListeners(): Promise<void> {
    if (isEnabled()) {
        emitter.on<UserEnrolled>(UserEnrolled, event => {
            const email = event.user.email
            if (!event.course.certification) {
                prepareAndSend('user-enrolled', email, { ...event })
            }
        })

        emitter.on<UserCompletedCourse>(UserCompletedCourse, event => {
            const template = 'user-completed-course'
            const email = event.user.email

            const emailDirectory = event.course.emails.includes(template) ? `courses/${event.course.slug}/emails` : ''

            prepareAndSend(template, email, { ...event } as Record<string, any>, emailDirectory)
        })
    }

    return Promise.resolve()
}
