import pug from 'pug'
import Mailgun from 'mailgun.js'
import { flattenAttributes } from '../utils'
import { loadFile } from './asciidoc'
import { notify } from '../middleware/bugsnag.middleware'
import formData from 'form-data';
import { decode } from 'html-entities'

export function isEnabled(): boolean {
    const { MAILGUN_API_KEY, MAILGUN_DOMAIN } = process.env

    return !!MAILGUN_API_KEY && !!MAILGUN_DOMAIN
}

interface Attachment {
    data: Buffer;
    filename: string;
}

export function send(to: string, subject: string, html: string, tag?: string, attachments?: Attachment[]): void {
    const { MAILGUN_API_KEY, MAILGUN_DOMAIN, MAIL_FROM, MAIL_REPLY_TO } = process.env

    if (MAILGUN_API_KEY && MAILGUN_DOMAIN) {
        const mailgun = new Mailgun(formData)

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
            tag,
            attachment: attachments,
        })
            .catch(err => {
                notify(err, event => {
                    event.setUser(undefined, to)
                })
            })
    }
}

export type AsciidocEmailFilename = 'user-completed-course' | 'user-enrolled' | 'user-enrolment-reminder' | 'reward-ordered' | 'reward-shipped'

interface PreparedEmail {
    subject: string;
    html: string;
}

export function prepareEmail(filename: AsciidocEmailFilename, attributesToBeFlattened: Record<string, Record<string, any>>, directory = ''): PreparedEmail {
    const attributes = flattenAttributes({
        base: { url: process.env.BASE_URL },
        ...attributesToBeFlattened,
    })

    const adoc = loadFile(`${directory}emails/${filename}.adoc`, { attributes })

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

export function prepareAndSend(filename: AsciidocEmailFilename, email: string, data: Record<string, Record<string, any>>, directory = '', tag?: string, attachments?: Attachment[]): void {
    const { MAILGUN_API_KEY, MAILGUN_DOMAIN } = process.env

    if (MAILGUN_DOMAIN && MAILGUN_API_KEY) {
        const { subject, html } = prepareEmail(filename, data, directory)

        send(email, decode(subject), html, tag, attachments)
    }
}
