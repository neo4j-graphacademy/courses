import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { UserCompletedCourse } from '../domain/events/UserCompletedCourse'
import { UserEnrolled } from '../domain/events/UserEnrolled'
import { getSuggestionsForEnrolment } from '../domain/services/get-suggestions-for-enrolment'
import { emitter } from '../events'
import { isEnabled, prepareAndSend, } from '../modules/mailer'
import { ASCIIDOC_DIRECTORY, MAIL_FROM, MAIL_REPLY_TO, MAILGUN_API_KEY, MAILGUN_DOMAIN } from '../constants'
import UserCreatedTeam from '../domain/events/UserCreatedTeam'
import { UserJoinedTeam } from '../domain/events/UserJoinedTeam'

export default function initEmailListeners(): Promise<void> {
    // const obscuredKey = MAILGUN_API_KEY ? `${MAILGUN_API_KEY.substring(0, 5)}...${MAILGUN_API_KEY.substring(MAILGUN_API_KEY.length - 6, MAILGUN_API_KEY.length - 1)}` : '(undefined)'

    // if (isEnabled()) {
    //     console.log('[email enabled]', { MAILGUN_API_KEY: obscuredKey, MAILGUN_DOMAIN, MAIL_FROM, MAIL_REPLY_TO });
    // }
    // else {
    //     console.log('[email disabled]', { MAILGUN_API_KEY: obscuredKey, MAILGUN_DOMAIN, MAIL_FROM, MAIL_REPLY_TO });
    // }

    if (isEnabled()) {
        emitter.on<UserEnrolled>(UserEnrolled, event => {
            if (event.user.unsubscribed) {
                return
            }

            const email = event.user.email

            const template = 'user-enrolled'
            const emailDirectory = event.course.emails?.includes(template) ? `courses/${event.course.slug}/` : ''

            if (!event.course.certification) {
                void prepareAndSend(template, email, { ...event }, emailDirectory, template)
            }
        })

        emitter.on<UserCompletedCourse>(UserCompletedCourse, async event => {
            if (event.user.unsubscribed) {
                return
            }

            const template = 'user-completed-course'
            const email = event.user.email

            let emailDirectory = ''

            if (event.course.certification && event.course.slug !== undefined && existsSync(join(ASCIIDOC_DIRECTORY, 'certifications', event.course.slug, 'emails'))) {
                emailDirectory = `certifications/${event.course.slug}/`
            }
            else if (event.course.emails?.includes(template)) {
                emailDirectory = `courses/${event.course.slug}/`
            }


            // Progress to
            let progressTo1, progressTo2, progressTo3

            if (event.course.progressTo?.length) {
                progressTo1 = event.course.progressTo[0]

                if (event.course.progressTo.length > 1) {
                    progressTo2 = event.course.progressTo[1]
                }

                if (event.course.progressTo.length > 2) {
                    progressTo3 = event.course.progressTo[2]
                }
            }

            // Get Course Recommendations
            let suggestion1, suggestion2, suggestion3, somethingDifferent

            if (event.course.enrolmentId) {
                const suggestions = await getSuggestionsForEnrolment(event.course.enrolmentId)

                if (suggestions.length > 0) {
                    suggestion1 = suggestions[0]
                }
                if (suggestions.length > 1) {
                    somethingDifferent = suggestions[suggestions.length - 1]
                }
                if (suggestions.length > 2) {
                    suggestion2 = suggestions[1]

                }
                if (suggestions.length > 3) {
                    suggestion2 = suggestions[2]
                }
            }


            // Summary PDF?
            const attachments = event.course.summaryPdf !== undefined ? [{
                filename: `${event.course.title} Summary.pdf`,
                data: readFileSync(event.course.summaryPdf)
            }] : []

            void prepareAndSend(
                template,
                email,
                {
                    ...event,
                    progressTo1,
                    progressTo2,
                    progressTo3,
                    suggestion1,
                    suggestion2,
                    suggestion3,
                    somethingDifferent
                } as Record<string, any>,
                emailDirectory,
                template,
                attachments
            )
        })

        emitter.on<UserCreatedTeam>(UserCreatedTeam, async event => {
            if (event.user.unsubscribed) {
                return
            }

            const email = event.user.email
            const template = 'user-created-team'

            void prepareAndSend(template, email, { ...event })
        })

        emitter.on<UserJoinedTeam>(UserJoinedTeam, async event => {
            if (event.user.unsubscribed) {
                return
            }

            const email = event.user.email
            const template = 'user-joined-team'

            void prepareAndSend(template, email, { ...event })
        })
    }

    return Promise.resolve()
}
