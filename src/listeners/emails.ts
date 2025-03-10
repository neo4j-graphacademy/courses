import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { UserCompletedCourse } from '../domain/events/UserCompletedCourse'
import { UserEnrolled } from '../domain/events/UserEnrolled'
import { getSuggestionsForEnrolment } from '../domain/services/get-suggestions-for-enrolment'
import { emitter } from '../events'
import { isEnabled, prepareAndSend } from '../modules/mailer/mailer'
import { ASCIIDOC_DIRECTORY, MAIL_FROM, MAIL_REPLY_TO, SENDGRID_API_KEY } from '../constants'
import { UserFailedCertification } from '../domain/events/UserFailedCertification'
import UserCreatedTeam from '../domain/events/UserCreatedTeam'
import { UserJoinedTeam } from '../domain/events/UserJoinedTeam'
import { AttachmentJSON } from '@sendgrid/helpers/classes/attachment'
import { courseSlidesPdfPath, courseSummaryPdfPath } from '../modules/asciidoc'

export default function initEmailListeners(): Promise<void> {
    const obscuredKey = SENDGRID_API_KEY
        ? `${SENDGRID_API_KEY.substring(0, 5)}...${SENDGRID_API_KEY.substring(
            SENDGRID_API_KEY.length - 6,
            SENDGRID_API_KEY.length - 1
        )}`
        : '(undefined)'

    if (isEnabled()) {
        console.log('[email enabled]', { SENDGRID_API_KEY: obscuredKey, MAIL_FROM, MAIL_REPLY_TO })
    } else {
        console.log('[email disabled]', { SENDGRID_API_KEY: obscuredKey, MAIL_FROM, MAIL_REPLY_TO })
    }

    if (isEnabled()) {
        emitter.on<UserEnrolled>(UserEnrolled, (event) => {
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

        emitter.on<UserFailedCertification>(UserFailedCertification, (event) => {
            if (event.user.unsubscribed) {
                return
            }

            const template = 'user-failed-exam'
            const email = event.user.email

            let emailDirectory = ''

            if (
                event.course.certification &&
                event.course.slug !== undefined &&
                existsSync(join(ASCIIDOC_DIRECTORY, 'certifications', event.course.slug, 'emails'))
            ) {
                emailDirectory = `certifications/${event.course.slug}/`
            } else if (event.course.emails?.includes(template)) {
                emailDirectory = `courses/${event.course.slug}/`
            }

            void prepareAndSend(template, email, event as Record<string, any>, emailDirectory, template)
        })

        emitter.on<UserCompletedCourse>(UserCompletedCourse, async (event) => {
            if (event.user.unsubscribed) {
                return
            }

            const template = 'user-completed-course'
            const email = event.user.email

            let emailDirectory = ''

            if (
                event.course.certification &&
                event.course.slug !== undefined &&
                existsSync(join(ASCIIDOC_DIRECTORY, 'certifications', event.course.slug, 'emails'))
            ) {
                emailDirectory = `certifications/${event.course.slug}/`
            } else if (event.course.emails?.includes(template)) {
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

            // Attach summary or
            const attachments: AttachmentJSON[] = []

            if (event.course.slug) {
                const courseSlidePdf = await courseSlidesPdfPath(event.course.slug)
                const courseSummaryPdf = await courseSummaryPdfPath(event.course.slug)

                if (typeof courseSlidePdf === 'string') {
                    attachments.push({
                        filename: `${event.course.title} Slides.pdf`,
                        content: readFileSync(courseSlidePdf).toString('base64'),
                    })
                }
                else if (typeof courseSummaryPdf === 'string') {
                    attachments.push({
                        filename: `${event.course.title} Summary.pdf`,
                        content: readFileSync(courseSummaryPdf).toString('base64'),
                    })
                }
            }

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
                    somethingDifferent,
                } as Record<string, any>,
                emailDirectory,
                template,
                attachments
            )
        })

        emitter.on<UserCreatedTeam>(UserCreatedTeam, async (event) => {
            if (event.user.unsubscribed) {
                return
            }

            const email = event.user.email
            const template = 'user-created-team'

            void prepareAndSend(template, email, { ...event })
        })

        emitter.on<UserJoinedTeam>(UserJoinedTeam, async (event) => {
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
