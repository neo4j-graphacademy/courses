import pug from 'pug'
import sgMail from '@sendgrid/mail'

import { AttachmentJSON } from '@sendgrid/helpers/classes/attachment'
import { flattenAttributes } from '../../utils'
import { loadFile } from '../asciidoc'
import { notify } from '../../middleware/bugsnag.middleware'
import { decode } from 'html-entities'
import { MAIL_FROM, MAIL_REPLY_TO, SENDGRID_API_KEY } from '../../constants'
import { log } from 'console'

export function isEnabled(): boolean {
    return !!SENDGRID_API_KEY
}

export async function send(
    to: string,
    subject: string,
    html: string,
    tag?: string,
    attachments?: AttachmentJSON[]
): Promise<void> {
    if (SENDGRID_API_KEY && MAIL_FROM) {
        sgMail.setApiKey(SENDGRID_API_KEY)

        const msg = {
            to,
            from: MAIL_FROM,
            subject,
            html,
            categories: tag ? [tag] : [],
            attachments,
        }

        try {
            await sgMail.send(msg)
        } catch (e: any) {
            notify(e, (event) => {
                event.setUser(undefined, to)
            })

            throw e
        }
    }
}

export type AsciidocEmailFilename =
    | 'user-completed-course'
    | 'user-enrolled'
    | 'user-enrolment-reminder'
    | 'reward-ordered'
    | 'reward-shipped'
    | 'user-failed-exam'
    | 'user-created-team'
    | 'user-joined-team'

interface PreparedEmail {
    subject: string
    html: string
}

export function prepareEmail(
    filename: AsciidocEmailFilename,
    attributesToBeFlattened: Record<string, string | Record<string, any>>,
    directory = ''
): PreparedEmail {
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

export async function prepareAndSend(
    filename: AsciidocEmailFilename,
    email: string,
    data: Record<string, string | Record<string, any>>,
    directory = '',
    tag?: string,
    attachments?: AttachmentJSON[]
): Promise<void> {
    const { MAILGUN_API_KEY, MAILGUN_DOMAIN } = process.env

    if (MAILGUN_DOMAIN && MAILGUN_API_KEY) {
        const { subject, html } = prepareEmail(filename, data, directory)

        await send(email, decode(subject), html, tag, attachments)
    }
}
