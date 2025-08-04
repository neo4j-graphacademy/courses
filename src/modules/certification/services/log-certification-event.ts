import {
    UI_EVENT_CONTENT_COPIED,
    UI_EVENT_CONTENT_PASTED,
    UI_EVENT_WINDOW_BLUR,
    UI_EVENT_WINDOW_FOCUS,
} from '../../../domain/events/UserUiEvent'
import { User } from '../../../domain/model/user'
import { write } from '../../neo4j'

export default async function logCertificationEvent(
    user: User,
    event:
        | string
        | typeof UI_EVENT_CONTENT_COPIED
        | typeof UI_EVENT_CONTENT_PASTED
        | typeof UI_EVENT_WINDOW_BLUR
        | typeof UI_EVENT_WINDOW_FOCUS,
    meta: Record<string, any>
) {
    // convert event to lowerCamelCase
    const eventName = event.replace(/-/g, '').toLowerCase()

    const { courseSlug, lessonSlug, ...props } = meta

    const res = await write(
        `
        MATCH (u:User {sub: $sub})-[:HAS_ENROLMENT]->(e:Enrolment)-[:FOR_COURSE]->(c:Course {slug: $courseSlug})
        MATCH (e)-[:HAS_ATTEMPT]->(a:CertificationAttempt)

        WITH e, a ORDER BY a.createdAt DESC LIMIT 1

        MATCH (a)-[r:ASSIGNED_QUESTION]->(q {id: $questionSlug})
        SET a[$event] = coalesce(a[$event], 0) + 1,
            r[$event] = coalesce(r[$event], 0) + 1

        CREATE (a)-[aer:EVENT_ON_QUESTION]->(q)
        SET aer.type = $event, aer += $props

        RETURN count(*) AS count
    `,
        {
            sub: user.sub,
            courseSlug: meta.courseSlug,
            questionSlug: meta.lessonSlug,
            event: eventName,
            props,
        }
    )
}
