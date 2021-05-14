import { write } from "../../modules/neo4j";
import { Answer } from "../model/answer";
import { LessonWithProgress } from "../model/lesson";
import { User } from "../model/user";

export async function saveLessonProgress(user: User, course: string, module: string, lesson: string, answers: Answer[]): Promise<LessonWithProgress> {
    const res = await write(`
        MATCH (u:User {id: $user})
        MATCH (c:Course)-[:HAS_MODULE]->(m)-[:HAS_LESSON]->(l)
        WHERE c.slug = $course AND m.slug = $module AND l.slug = $lesson

        MATCH (u)-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c)

        // Log Attempt
        MERGE (a:Attempt { id: apoc.text.base64Encode(u.id + '--'+ l.id + '--' + toString(datetime())) })
        SET a.createdAt = datetime()

        MERGE (e)-[:HAS_ATTEMPT]->(a)

        // Log Answers
        FOREACH (row in $answers |
            MERGE (q:Question {id: apoc.text.base64Encode(l.id + '--'+ row.id)})
            ON CREATE SET q.slug = row.id
            MERGE (l)-[:HAS_QUESTION]->(q)

            MERGE (an:Answer { id: apoc.text.base64Encode(u.id + '--'+ l.id + '--' + toString(datetime()) +'--'+ q.id) })
            SET an.createdAt = datetime(),
                an.correct = row.correct,
                an.answers = row.answers

            FOREACH (_ IN CASE WHEN row.correct = true THEN [1] ELSE [] END |
                SET an:CorrectAnswer
            )
            FOREACH (_ IN CASE WHEN row.correct = false THEN [] ELSE [1] END |
                SET an:IncorrectAnswer
            )

            MERGE (a)-[:PROVIDED_ANSWER]->(an)
            MERGE (an)-[:TO_QUESTION]->(q)
        )

        WITH u, c, l, m, e, a, size((l)-[:HAS_QUESTION]->()) AS questions, size((a)-[:PROVIDED_ANSWER]->(:CorrectAnswer)) AS correctAnswers

        // Are all answers correct?
        FOREACH (_ IN CASE
            WHEN questions = correctAnswers
            THEN [1] ELSE [] END |

            SET a:SuccessfulAttempt
            MERGE (e)-[:COMPLETED_LESSON]->(l)
        )

        // Has the module been completed?
        WITH c, m, l, e, size((m)-[:HAS_LESSON]->(l)) AS lessons, size((e)-[:COMPLETED_LESSON]->(l)) as completed

        FOREACH (_ IN CASE WHEN lessons = completed THEN [1] ELSE [] END |
            MERGE (e)-[:COMPLETED_MODULE]->(m)
        )

        WITH c, m, l, e, size((c)-[:HAS_MODULE]->(l)) AS modules, size((e)-[:COMPLETED_MODULE]->(l)) as completed

        FOREACH (_ IN CASE WHEN modules = completed THEN [1] ELSE [] END |
            SET e:Completed,
                e.completedAt = coalesce(e.completedAt, datetime())
        )

        RETURN l {
            .*,
            completed: exists((e)-[:COMPLETED_LESSON]->(l)),
            link: '/courses/'+ c.slug +'/'+ m.slug +'/'+ l.slug,
            next: [ (l)-[:NEXT_LESSON]->(next)<-[:HAS_LESSON]-(nm) | next { .slug, .title, link: '/courses/'+ c.slug + '/'+ nm.slug +'/'+ next.slug } ][0],
            questions: [(l)-[:HAS_QUESTION]->(q) | q { .id, .slug }]
        } AS l
    `, {
        user: user.user_id,
        course,
        module,
        lesson,
        answers,
    })

    return res.records[0].get('l')
}