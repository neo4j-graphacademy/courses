import { write } from "../../../modules/neo4j";
import { FeedbackPayload, FeedbackResponse } from "../../model/feedback";
import { User } from "../../model/user";

export async function saveLessonFeedback(user: User, course: string, module: string, lesson: string, feedback: FeedbackPayload): Promise<FeedbackResponse> {
    const res = await write(`
        MATCH (u:User {sub: $user})
        MATCH (c:Course)-[:HAS_MODULE]->(m)-[:HAS_LESSON]->(l)
        WHERE c.slug = $course AND m.slug = $module AND l.slug = $lesson

        CREATE (f:Feedback:LessonFeedback {
            id: apoc.text.base64Encode(l.id + '--'+ u.sub + '--'+ toString(datetime())),
            createdAt: datetime()
        })
        SET f += $feedback

        FOREACH (_ IN CASE WHEN $feedback.helpful = true THEN [1] ELSE [] END | SET f:PositiveFeedback )
        FOREACH (_ IN CASE WHEN $feedback.helpful = false THEN [1] ELSE [] END | SET f:NegativeFeedback )

        CREATE (u)-[:PROVIDED_FEEDBACK]->(f)
        CREATE (f)-[:FOR_LESSON]->(l)

        RETURN f.id AS id

    `, { user: user.sub, course, module, lesson, feedback })

    if ( res.records.length === 0 ) {
        return {
            status: 'error',
            message: 'User or course not found',
        }
    }

    return {
        status: 'ok',
        id: res.records[0].get('id')
    }
}
