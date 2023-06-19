import { read } from "../../../modules/neo4j";

interface AbridgedFeedback {
    createdAt: string;
    reason: string;
    additional: string | undefined,
    user: { email: string, name: string };
}

interface GetFeedbackResponse {
    latest: AbridgedFeedback[];
    total: number;
    positive: number;
    negative: number;
    percentage: number;
}

export enum FeedbackType {
    Lesson = 'Lesson',
    Module = 'Module',
}


export async function getFeedback(type: FeedbackType, link: string): Promise<GetFeedbackResponse> {
    const res = await read(`
        MATCH (t:${type} {link: $link})<-[:FOR_LESSON|FOR_MODULE]-(f:Feedback)
        WITH t, f ORDER BY f.createdAt DESC
        WITH t, collect(f) AS feedback

        WITH t, feedback, size(feedback) AS total, size([ n in feedback WHERE n:PositiveFeedback | n ]) AS positive, size([ n in feedback WHERE n:NegativeFeedback | n ]) AS negative

        RETURN
            total,
            positive,
            negative,
            round(100.0 * positive/total, 2) AS percentage,
            [ n IN feedback WHERE n:NegativeFeedback | n {
                .reason,
                .additional,
                createdAt: toString(n.createdAt),
                status: CASE WHEN (n)<-[:PROVIDED_FEEDBACK]-()-[:HAS_ENROLMENT]->()-[:COMPLETED_LESSON|COMPLETED_MODULE]->(t) THEN 'Completed Lesson' ELSE 'Not Completed Lesson' END,
                user: [ (n)<-[:PROVIDED_FEEDBACK]-(u) | u { .email, name: coalesce(u.name, u.displayName, u.givenName, '?') } ][0]
            } ][0..20] AS latest
    `, { link })

    if (res.records.length === 0) {
        return {
            latest: [],
            total: 0,
            positive: 0,
            negative: 0,
            percentage: 0,
        }
    }

    return res.records[0].toObject() as GetFeedbackResponse
}