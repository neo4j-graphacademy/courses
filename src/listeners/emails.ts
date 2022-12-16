import { UserCompletedCourse } from '../domain/events/UserCompletedCourse'
import { UserEnrolled } from '../domain/events/UserEnrolled'
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

        emitter.on<UserCompletedCourse>(UserCompletedCourse, event => {
            if (event.user.unsubscribed) {
                return
            }

            const template = 'user-completed-course'
            const email = event.user.email

            const emailDirectory = event.course.emails?.includes(template) ? `courses/${event.course.slug}/` : ''

            prepareAndSend(template, email, { ...event } as Record<string, any>, emailDirectory, template)
        })
    }

    return Promise.resolve()
}
