import { write } from "../../../modules/neo4j";
import { FeedbackPayload, FeedbackResponse } from "../../model/feedback";
import { User } from "../../model/user";

export async function saveModuleFeedback(user: User, course: string, module: string, feedback: FeedbackPayload): Promise<FeedbackResponse> {
    const res = await write(`
        MATCH (u:User {sub: $user})
        MATCH (c:Course)-[:HAS_MODULE]->(m)
        WHERE c.slug = $course AND m.slug = $module

        CREATE (f:Feedback:ModuleFeedback {
            id: apoc.text.base64Encode(m.id + '--'+ u.sub + '--'+ toString(datetime())),
            createdAt: datetime()
        })
        SET f += $feedback

        FOREACH (_ IN CASE WHEN $feedback.helpful = true THEN [1] ELSE [] END | SET f:PositiveFeedback )
        FOREACH (_ IN CASE WHEN $feedback.helpful = false THEN [1] ELSE [] END | SET f:NegativeFeedback )

        CREATE (u)-[:PROVIDED_FEEDBACK]->(f)
        CREATE (f)-[:FOR_MODULE]->(m)

        RETURN f.id AS id

    `, { user: user.sub, course, module, feedback })

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
