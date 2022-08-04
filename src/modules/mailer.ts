import pug from 'pug'
import Mailgun from 'mailgun.js'
import { flattenAttributes } from '../utils'
import { loadFile } from './asciidoc'
import { notify } from '../middleware/bugsnag.middleware'

export function isEnabled(): boolean {
    const { MAILGUN_API_KEY, MAILGUN_DOMAIN } = process.env

    return !!MAILGUN_API_KEY && !!MAILGUN_DOMAIN
}

export function send(to: string, subject: string, html: string): void {
    const { MAILGUN_API_KEY, MAILGUN_DOMAIN, MAIL_FROM, MAIL_REPLY_TO } = process.env

    if (MAILGUN_API_KEY && MAILGUN_DOMAIN) {
        const mailgun = new Mailgun(URLSearchParams)

        const mailer = mailgun.client({
            username: 'api',
            key: MAILGUN_API_KEY,
        })

        mailer.messages.create(MAILGUN_DOMAIN, {
            from: MAIL_FROM,
            'h:Reply-To': MAIL_REPLY_TO,
            to,
            subject,
            html,
        })
            .catch(err => {
                notify(err, event => {
                    event.setUser(undefined, to)
                })
            })
    }
}

export type AsciidocEmailFilename = 'user-completed-course' | 'user-enrolled' | 'user-enrolment-reminder'

interface PreparedEmail {
    subject: string;
    html: string;
}

export function prepareEmail(filename: AsciidocEmailFilename, attributesToBeFlattened: Record<string, Record<string, any>>): PreparedEmail {
    const attributes = flattenAttributes({
        base: { url: process.env.BASE_URL },
        ...attributesToBeFlattened,
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
