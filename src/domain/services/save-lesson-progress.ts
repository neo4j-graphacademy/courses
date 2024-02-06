import NotFoundError from "../../errors/not-found.error";
import { emitter } from "../../events";
import { writeTransaction } from "../../modules/neo4j";
import { formatCourse } from "../../utils";
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
import { appendParams, courseCypher, lessonCypher } from "./cypher";

export async function saveLessonProgress(user: User, course: string, module: string, lesson: string, answers: Answer[], token?: string, ref?: string): Promise<LessonWithProgress & { answers: Answer[] }> {
    const {
        lessonWithProgress,
        moduleWithProgress,
        moduleCompletedInTransaction,
        courseWithProgress,
        courseCompletedInTransaction,
    } = await writeTransaction(async tx => {
        // Save Answers
        const lessonResult = await tx.run(`
            MATCH (u:User)-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c:Course)-[:HAS_MODULE]->(m)-[:HAS_LESSON]->(l)
            USING INDEX u:User(sub)
            WHERE u.sub = $sub AND c.slug = $course AND m.slug = $module AND l.slug = $lesson

            SET e.lastSeenAt = datetime()

            // Log Attempt
            MERGE (a:Attempt { id: apoc.text.base64Encode(u.sub + '--'+ l.id + '--' + toString(datetime())) })
            SET a.createdAt = datetime(), a.ref = $ref
            MERGE (e)-[:HAS_ATTEMPT]->(a)
            MERGE (a)-[:ATTEMPTED_LESSON]->(l)

            // Log Answers
            FOREACH (row in $answers |
                MERGE (q:Question {id: apoc.text.base64Encode(l.id + '--'+ row.id)})
                ON CREATE SET q.slug = row.id
                MERGE (l)-[:HAS_QUESTION]->(q)

                MERGE (an:Answer { id: apoc.text.base64Encode(u.sub + '--'+ l.id + '--' + toString(datetime()) +'--'+ q.id) })
                SET an.createdAt = datetime(),
                    an.reason = row.reason,
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

            FOREACH (_ IN CASE WHEN size($answers) = size( [ (l)-[:HAS_QUESTION]->(q:Question) WHERE not q:DeletedQuestion | q ] ) AND ALL (a IN $answers WHERE a.correct = true) THEN [1] ELSE [] END |
                SET a:SuccessfulAttempt
                MERGE (e)-[r:COMPLETED_LESSON]->(l)
                SET r.createdAt = datetime()
            )

            RETURN ${lessonCypher('e')} AS lesson
        `, {
            sub: user.sub,
            ref: ref || null,
            course,
            module,
            lesson,
            answers,
        })
        if (lessonResult.records.length === 0) {
            throw new NotFoundError(`Enrolment not found for ${user.sub} on ${course}`)
        }

        const lessonOutput: LessonWithProgress = lessonResult.records[0].get('lesson')

        // Check Enrolment Status for module
        const moduleResult = await tx.run(`
            MATCH (u:User)-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c:Course)-[:HAS_MODULE]->(m)
            WHERE u.sub = $sub AND c.slug = $course AND m.slug = $module

            WITH u, e, m,
                [ (m)-[:HAS_LESSON]->(l) WHERE NOT l:OptionalLesson | l ] AS lessons,
                [ (e)-[:COMPLETED_LESSON]->(l)<-[:HAS_LESSON]-(m) WHERE NOT l:OptionalLesson AND NOT l.status IN $exclude | l ] AS completed

            WITH u, e, m, lessons, completed,
                size([ (e)-[:COMPLETED_MODULE]->(m) | m ]) = 0 AND all(x IN lessons WHERE x IN completed) AS shouldComplete

            FOREACH (_ IN CASE WHEN shouldComplete THEN [1] ELSE [] END |
                MERGE (e)-[r:COMPLETED_MODULE]->(m)
                SET  r.createdAt = datetime()
            )

            RETURN m {
                .*,
                completed: exists((e)-[:COMPLETED_MODULE]->(m))
            } AS module,
            shouldComplete
        `, appendParams({
            sub: user.sub,
            course,
            module,
        }))

        const moduleOutput: ModuleWithProgress = moduleResult.records[0].get('module')
        const moduleShouldComplete: boolean = moduleResult.records[0].get('shouldComplete')

        // Get Enrolment Status
        const courseResult = await tx.run(`
            MATCH (u:User {sub: $sub})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c:Course {slug: $course})

            WITH u, e, c,
                size([ (e)-[:COMPLETED_LESSON]->(l) WHERE NOT l:OptionalLesson | l ]) AS completed,
                size([ (c)-[:HAS_MODULE]->()-[:HAS_LESSON]->(l) WHERE NOT l:OptionalLesson | l ]) as total

            WITH u, e, c, completed, total, NOT e:CompletedEnrolment AND completed = total AS shouldComplete

            FOREACH (_ IN CASE WHEN shouldComplete THEN [1] ELSE [] END |
                SET e:CompletedEnrolment,
                    e.completedAt = datetime()
            )

            RETURN ${courseCypher('e', 'u')} AS course, shouldComplete
        `, appendParams({ sub: user.sub, course }))

        const courseOutput: CourseWithProgress = await formatCourse<CourseWithProgress>(courseResult.records[0].get('course'))
        const shouldComplete: boolean = courseResult.records[0].get('shouldComplete')

        return {
            lessonWithProgress: {
                ...lessonOutput,
                courseCompleted: courseOutput.completed,
            },
            moduleWithProgress: moduleOutput,
            moduleCompletedInTransaction: moduleShouldComplete,
            courseWithProgress: courseOutput,
            courseCompletedInTransaction: shouldComplete,
        }
    })

    // Emit that the user as attempted the lesson
    emitter.emit(new UserAttemptedLesson(user, courseWithProgress, moduleWithProgress, lessonWithProgress, lessonWithProgress.completed, answers))

    // Emit individual Answers
    answers.forEach(answer => {
        emitter.emit(new UserAnsweredQuestion(user, lessonWithProgress, answer))
    })

    // Emit if user has completed the lesson
    if (lessonWithProgress.completed) {
        emitter.emit(new UserCompletedLesson(user, courseWithProgress, moduleWithProgress, lessonWithProgress))

        // Emit if user has completed the module
        if (moduleCompletedInTransaction && moduleWithProgress.completed) {
            emitter.emit(new UserCompletedModule(user, moduleWithProgress))

            // Emit if user has completed the course
            if (courseCompletedInTransaction && courseWithProgress.completed) {
                emitter.emit(new UserCompletedCourse(user, courseWithProgress, token))
            }
        }
    }

    return {
        ...lessonWithProgress,
        answers,
    } as LessonWithProgress & { answers: Answer[] }
}
