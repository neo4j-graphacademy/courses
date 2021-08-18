import { emitter } from "../../events";
import { write } from "../../modules/neo4j";
import { UserAnsweredQuestion } from "../events/UserAnsweredQuestion";
import { UserAttemptedLesson } from "../events/UserAttemptedLesson";
import { UserCompletedCourse } from "../events/UserCompletedCourse";
import { UserCompletedLesson } from "../events/UserCompletedLesson";
import { UserCompletedModule } from "../events/UserCompletedModule";
import { Answer } from "../model/answer";
import { CourseWithProgress } from "../model/course";
import { LessonWithProgress } from "../model/lesson";
import { ModuleWithProgress } from "../model/module";
import { User } from "../model/user";
import { courseCypher, lessonCypher } from "./cypher";

export async function saveLessonProgress(user: User, course: string, module: string, lesson: string, answers: Answer[]): Promise<LessonWithProgress> {
    const res = await write(`
        MATCH (u:User {sub: $sub})
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
            FOREACH (_ IN CASE WHEN row.correct = false THEN [1] ELSE [] END |
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
        WITH c, m, l, e, size((m)-[:HAS_LESSON]->()) AS lessons, size((e)-[:COMPLETED_LESSON]->()<-[:HAS_LESSON]-(m)) as completed

        FOREACH (_ IN CASE WHEN lessons = completed THEN [1] ELSE [] END |
            MERGE (e)-[:COMPLETED_MODULE]->(m)
        )

        WITH c, m, l, e, size((c)-[:HAS_MODULE]->()) AS modules, size((e)-[:COMPLETED_MODULE]->()) as completed

        FOREACH (_ IN CASE WHEN modules = completed THEN [1] ELSE [] END |
            SET e:CompletedEnrolment,
                e.completedAt = coalesce(e.completedAt, datetime())
        )

        RETURN
            ${lessonCypher('e')} AS lesson,
            m {
                .*,
                completed: exists((e)-[:COMPLETED_MODULE]->(m))
            } AS module,
            ${courseCypher('e', 'u')} AS course
    `, {
        sub: user.sub,
        course,
        module,
        lesson,
        answers,
    })

    const output: LessonWithProgress = res.records[0].get('lesson')
    const mod: ModuleWithProgress = res.records[0].get('module')
    const co: CourseWithProgress = res.records[0].get('course')


    // Emit that the user as attempted the lesson
    emitter.emit(new UserAttemptedLesson(user, output, output.completed, answers))

    // Emit individual Answers
    answers.forEach(answer => {
        emitter.emit(new UserAnsweredQuestion(user, output, answer))
    })

    // Emit if user has completed the lesson
    if ( output.completed ) {
        emitter.emit(new UserCompletedLesson(user, output))
    }

    // Emit if user has completed the module
    if ( mod.completed ) {
        emitter.emit(new UserCompletedModule(user, mod))
    }

    // Emit if user has completed the course
    if (co.completed) {
        emitter.emit(new UserCompletedCourse(user, co))
    }

    return output
}