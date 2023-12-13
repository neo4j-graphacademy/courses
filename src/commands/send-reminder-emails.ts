import { int } from 'neo4j-driver-core'
import { prepareAndSend } from '../modules/mailer'
import initNeo4j, { close, read, write } from "../modules/neo4j"

import {
    NEO4J_HOST,
    NEO4J_USERNAME,
    NEO4J_PASSWORD,
    // ENROLMENT_REMINDER_LIMIT,
    // ENROLMENT_REMINDER_DAYS,
} from '../constants'
import { courseSummaryPdfPath } from '../modules/asciidoc'
import { readFileSync } from 'fs'

const main = async () => {
    await initNeo4j(NEO4J_HOST, NEO4J_USERNAME, NEO4J_PASSWORD)

    // const days = ENROLMENT_REMINDER_DAYS !== undefined ? parseInt(ENROLMENT_REMINDER_DAYS) : 7
    // const limit = ENROLMENT_REMINDER_LIMIT !== undefined ? parseInt(ENROLMENT_REMINDER_LIMIT) : 50

    // Get enrolments that haven't been updated in the last X days and 23 hours
    // (but hasn't had another reminder email in the last three days)
    const res = await read(`
        MATCH (u:User)-[:HAS_ENROLMENT]->(e:Enrolment)-[:FOR_COURSE]->(c)
        WHERE datetime() - duration('P7DT1H30M') <= e.lastSeenAt AND e.lastSeenAt <= datetime() - duration('P7D')
          AND not e:CompletedEnrolment
          AND (e.reminderSentAt IS NOT NULL OR e.reminderSentAt < datetime() - duration('P5D'))
          AND u.email IS NOT NULL
          AND u.unsubscribed IS NULL
          AND size([(u)-[:HAS_ENROLMENT]->(e) WHERE e.reminderSentAt IS NOT NULL AND e.reminderSentAt >= datetime.truncate('day') - duration('P2D') | e]) = 0
        RETURN u {
            .*,
            _name: coalesce(u.givenName, u.name),
            _email: u.email
        } AS user,
        e {
            .*
        } AS enrolment,
        c { .id, .slug, .title, .link } AS course
        LIMIT $limit
    `, {})

    console.log(`🚨 Preparing ${res.records.length} Reminder Email${res.records.length == 1 ? '' : 's'}`);

    // Send reminder emails
    const ids = await Promise.all(
        res.records
            .map(row => row.toObject())
            .map(async (attributes: Record<string, any>) => {
                const courseSummaryPdf = await courseSummaryPdfPath(attributes.course.slug)
                const attachments = typeof courseSummaryPdf === 'string' ? [{
                    filename: `${attributes.course.title} Summary.pdf`,
                    data: readFileSync(courseSummaryPdf),
                }] : []

                prepareAndSend('user-enrolment-reminder', attributes.user.email, attributes, '', 'user-enrolment-reminder', attachments)

                return attributes.enrolment.id as string
            })
            .filter(e => e !== undefined)
    )

    // Update enrolments to stop duplicate reminders being sent
    await write(`
        UNWIND $ids AS id
        MATCH (e:Enrolment {id: id})
        SET e.reminderSentAt = datetime()
        RETURN count(*)
    `, { ids })

    await close()
}

// eslint-disable-next-line
main()
