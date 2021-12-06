import pug from 'pug'
import mailgun, { Mailgun, Error as MailgunError } from 'mailgun-js'
import { flattenAttributes } from '../utils'
import { convert, loadFile } from './asciidoc'
import { notify } from '../middleware/bugsnag'

export function isEnabled(): boolean {
    const { MAILGUN_API_KEY, MAILGUN_DOMAIN } = process.env

    return !!MAILGUN_API_KEY && !!MAILGUN_DOMAIN
}

export function send(to: string, subject: string, html: string): void {
    const { MAILGUN_API_KEY, MAILGUN_DOMAIN, MAIL_FROM, MAIL_REPLY_TO } = process.env

    if (MAILGUN_API_KEY && MAILGUN_DOMAIN) {
        const mailer = mailgun({
            apiKey: MAILGUN_API_KEY as string,
            domain: MAILGUN_DOMAIN as string,
        })

        mailer.messages().send({
            from: MAIL_FROM,
            "h:Reply-To": MAIL_REPLY_TO,
            to,
            subject,
            html,
        }, (err: MailgunError, body) => {
            if (err) {
                notify(new Error(err.message), event => {
                    event.setUser(undefined, to)
                })
            }
        })
    }
}

export type AsciidocEmailFilename = 'user-completed-course' | 'user-enrolled' | 'user-enrolment-reminder'

interface PreparedEmail {
    subject: string;
    html: string;
}

export function prepareEmail(filename: AsciidocEmailFilename, data: Record<string, Record<string, any>>): PreparedEmail {
    const attributes = flattenAttributes({
        base: { url: process.env.BASE_URL },
        ...data,
    })

    const adoc = loadFile(`emails/${filename}.adoc`, { attributes })

    const subject = `🎓 Neo4j GraphAcademy: ${adoc.getTitle()}`

    const html = pug.renderFile('views/emails/template.pug', {
        title: adoc.getTitle(),
        content: adoc.getContent(),
    })

    return {
        subject,
        html,
    }
}

export function prepareAndSend(filename: AsciidocEmailFilename, email: string, data: Record<string, Record<string, any>>): void {
    const { MAILGUN_API_KEY, MAILGUN_DOMAIN } = process.env

    if (MAILGUN_DOMAIN && MAILGUN_API_KEY) {
        const { subject, html } = prepareEmail(filename, data)

        send(email, subject, html)
    }
}
