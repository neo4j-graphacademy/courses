import { UserCompletedCourse } from '../domain/events/UserCompletedCourse'
import { UserEnrolled } from '../domain/events/UserEnrolled'
import { emitter } from '../events'
import { isEnabled, prepareEmail, send } from '../modules/mailer'



export default async function initEmailListeners(): Promise<void> {
    if ( !isEnabled() ) {
        return
    }

    emitter.on<UserEnrolled>(UserEnrolled, event => {
        const email = event.user.email
        const { subject, html } = prepareEmail('user-enrolled', { ...event })

        send(email, subject, html)
    })

    emitter.on<UserCompletedCourse>(UserCompletedCourse, event => {
        const email = event.user.email
        const { subject, html } = prepareEmail('user-completed-course', { ...event })

        send(email, subject, html)
    })
}
