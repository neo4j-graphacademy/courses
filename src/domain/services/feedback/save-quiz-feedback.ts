import { write } from "../../../modules/neo4j";
import { FeedbackPayload, FeedbackResponse } from "../../model/feedback";
import { User } from "../../model/user";

export async function saveQuizFeedback(user: User, course: string, feedback: FeedbackPayload): Promise<FeedbackResponse> {
    const res = await write(`
        MATCH (u:User {sub: $user})
        MATCH (c:Course {slug: $course})

        CREATE (f:Feedback:QuizFeedback {
            id: randomUuid(),
            createdAt: datetime()
        })
        SET f += $feedback

        FOREACH (_ IN CASE WHEN $feedback.helpful = true THEN [1] ELSE [] END | SET f:PositiveFeedback )
        FOREACH (_ IN CASE WHEN $feedback.helpful = false THEN [1] ELSE [] END | SET f:NegativeFeedback )

        CREATE (u)-[:PROVIDED_FEEDBACK]->(f)
        CREATE (f)-[:FOR_COURSE]->(c)

        RETURN f.id AS id
    `, {
        user: user.sub,
        course,
        feedback
    })

    if (res.records.length === 0) {
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
