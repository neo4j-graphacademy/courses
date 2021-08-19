import pug from 'pug'
import mailgun, { Mailgun, Error as MailgunError } from 'mailgun-js'
import { flattenAttributes } from '../utils'
import { loadFile } from './asciidoc'
import { notify } from '../middleware/bugsnag'

const {
    MAILGUN_DOMAIN,
    MAILGUN_API_KEY,
    MAIL_FROM,
    MAIL_REPLY_TO,
} = process.env

let mailer: Mailgun

if ( MAILGUN_API_KEY && MAILGUN_DOMAIN ) {
    mailer = mailgun({
        apiKey: MAILGUN_API_KEY as string,
        domain: MAILGUN_DOMAIN as string,
    })
}

export function isEnabled(): boolean {
    return !!MAILGUN_API_KEY && !!MAILGUN_DOMAIN
}

export function send(to: string, subject: string, html: string): void {
    if (mailer) {
        mailer.messages().send({
            from: MAIL_FROM,
            "h:Reply-To": MAIL_REPLY_TO,
            to,
            subject,
            html,
        }, (err: MailgunError, body) => {
            if (err) {
                notify(new Error(err.message))
            }
        })
    }
}

export type AsciidocEmail = 'user-completed-course' | 'user-enrolled' | 'user-enrolment-reminder'

interface PreparedEmail {
    subject: string;
    html: string;
}

export function prepareEmail(filename: AsciidocEmail, data: Record<string, Record<string, any>>): PreparedEmail {
    const attributes = flattenAttributes({
        base: { url: process.env.BASE_URL },
        ...data,
    })

    const adoc = loadFile(`emails/${filename}.adoc`, { attributes })

    const subject = `🎓 Neo4j GraphAcademy: ${adoc.getTitle()}`

    const html = pug.renderFile('views/emails/template.pug', {
        title: adoc.getTitle(),
        content: adoc.getContent()
    })

    return {
        subject,
        html,
    }
}

export function prepareAndSend(filename: AsciidocEmail, email: string, data: Record<string, Record<string, any>>): void {
    const { subject, html } = prepareEmail(filename, data)

    send(email, subject, html)
}