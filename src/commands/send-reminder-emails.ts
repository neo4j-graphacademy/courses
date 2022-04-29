import { int } from 'neo4j-driver-core'
import { prepareAndSend } from '../modules/mailer'
import initNeo4j, { close, read, write } from "../modules/neo4j"

import {
    NEO4J_HOST,
    NEO4J_USERNAME,
    NEO4J_PASSWORD,
    ENROLMENT_REMINDER_LIMIT,
    ENROLMENT_REMINDER_DAYS,
} from '../constants'

const main = async () => {
    await initNeo4j(NEO4J_HOST!, NEO4J_USERNAME!, NEO4J_PASSWORD!)

    const days = ENROLMENT_REMINDER_DAYS !== undefined ? parseInt(ENROLMENT_REMINDER_DAYS) : 7
    const limit = ENROLMENT_REMINDER_LIMIT !== undefined ? parseInt(ENROLMENT_REMINDER_LIMIT) : 50

    // Get enrolments that haven't been updated in the last X days
    // (but hasn't had another reminder email in the last three days)
    const res = await read(`
        MATCH (u:User)-[:HAS_ENROLMENT]->(e:Enrolment)-[:FOR_COURSE]->(c)
        WHERE e.createdAt <= datetime() - duration('P${days}D')
          AND e.lastSeenAt <= datetime() - duration('P${days}D')
          AND not e:CompletedEnrolment
          AND not exists(e.reminderSentAt)
          AND exists(u.email)
          AND size([(u)-[:HAS_ENROLMENT]->(e) WHERE exists(e.reminderSentAt) AND e.reminderSentAt >= datetime.truncate('day') - duration('P3D') | e]) = 0
        RETURN u {
            .*,
            _name: coalesce(u.givenName, u.name),
            _email: u.email
        } AS user,
        e {
            .*
        } AS enrolment,
        c { .id, .title, .link } AS course
        LIMIT $limit
    `, { limit: int(limit) })


    // tslint:disable-next-line
    console.log(`🚨 Preparing ${res.records.length} Reminder Email${res.records.length == 1 ? '' : 's'}`);

    // Send reminder emails
    const ids = await Promise.all(
        res.records
            .map(row => row.toObject())
            .map((attributes: Record<string, any>) => {
                prepareAndSend('user-enrolment-reminder', attributes.user.email, attributes)

                return attributes.enrolment.id
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


main()