import { UserCompletedCourse } from '../domain/events/UserCompletedCourse'
import { UserEnrolled } from '../domain/events/UserEnrolled'
import { emitter } from '../events'
import { isEnabled, prepareAndSend } from '../modules/mailer'



export default async function initEmailListeners(): Promise<void> {
    if ( !isEnabled() ) {
        return
    }

    emitter.on<UserEnrolled>(UserEnrolled, event => {
        const email = event.user.email
        prepareAndSend('user-enrolled', email, { ...event })
    })

    emitter.on<UserCompletedCourse>(UserCompletedCourse, event => {
        const email = event.user.email
        prepareAndSend('user-completed-course', email, { ...event })
    })
}
