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

export async function saveLessonProgress(user: User, course: string, module: string, lesson: string, answers: Answer[]): Promise<LessonWithProgress> {
    const {
        lessonWithProgress,
        moduleWithProgress,
        courseWithProgress
    } = await writeTransaction(async tx => {
        // Save Answers
        const lessonResult = await tx.run(`
            MATCH (u:User)-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c:Course)-[:HAS_MODULE]->(m)-[:HAS_LESSON]->(l)
            WHERE u.sub = $sub AND c.slug = $course AND m.slug = $module AND l.slug = $lesson

            // Log Attempt
            MERGE (a:Attempt { id: apoc.text.base64Encode(u.sub + '--'+ l.id + '--' + toString(datetime())) })
            SET a.createdAt = datetime()
            MERGE (e)-[:HAS_ATTEMPT]->(a)

            // Log Answers
            FOREACH (row in $answers |
                MERGE (q:Question {id: apoc.text.base64Encode(l.id + '--'+ row.id)})
                ON CREATE SET q.slug = row.id
                MERGE (l)-[:HAS_QUESTION]->(q)

                MERGE (an:Answer { id: apoc.text.base64Encode(u.sub + '--'+ l.id + '--' + toString(datetime()) +'--'+ q.id) })
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



            FOREACH (_ IN CASE WHEN ALL (a IN $answers WHERE a.correct) THEN [1] ELSE [] END |
                SET a:SuccessfulAttempt
                MERGE (e)-[r:COMPLETED_LESSON]->(l)
                SET r.createdAt = datetime()
            )

            RETURN ${lessonCypher('e')} AS lesson
        `, {
            sub: user.sub,
            course,
            module,
            lesson,
            answers,
        })

        if ( lessonResult.records.length === 0 ) {
            throw new NotFoundError(`Enrolment not found for ${user.sub} on ${course}/`)
        }

        const lessonOutput: LessonWithProgress = lessonResult.records[0].get('lesson')

        // Check Enrolment Status for module
        const moduleResult = await tx.run(`
            MATCH (u:User)-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c:Course)-[:HAS_MODULE]->(m)
            WHERE u.sub = $sub AND c.slug = $course AND m.slug = $module

            WITH u, e, m, [ (m)-[:HAS_LESSON]->(l) | l ] AS lessons, [ (e)-[:COMPLETED_LESSON]->(l) WHERE not l.status IN $exclude | l ] AS completed

            FOREACH (_ IN CASE WHEN all(l IN lessons WHERE l IN completed) THEN [1] ELSE [] END |
                MERGE (e)-[r:COMPLETED_MODULE]->(m)
                SET  r.createdAt = datetime()
            )

            RETURN m {
                .*,
                completed: exists((e)-[:COMPLETED_MODULE]->(m))
            } AS module
        `, appendParams({
            sub: user.sub,
            course,
            module,
        }))

        const moduleOutput: ModuleWithProgress = moduleResult.records[0].get('module')

        // Get Enrolment Status
        const courseResult = await tx.run(`
            MATCH (u:User {sub: $sub})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c:Course {slug: $course})

            WITH u, e, c, size((e)-[:COMPLETED_MODULE]->()) AS completed, size((c)-[:HAS_MODULE]->()) AS total

            FOREACH (_ IN CASE WHEN completed = total THEN [1] ELSE [] END |
                SET e:CompletedEnrolment,
                    e.completedAt = datetime()
            )

            RETURN ${courseCypher('e', 'u')} AS course
        `, appendParams({ sub: user.sub, course }))

        const courseOutput: CourseWithProgress = await formatCourse<CourseWithProgress>(courseResult.records[0].get('course'))

        return {
            lessonWithProgress: lessonOutput,
            moduleWithProgress: moduleOutput,
            courseWithProgress: courseOutput,
        }
    })

    // Emit that the user as attempted the lesson
    emitter.emit(new UserAttemptedLesson(user, lessonWithProgress, lessonWithProgress.completed, answers))

    // Emit individual Answers
    answers.forEach(answer => {
        emitter.emit(new UserAnsweredQuestion(user, lessonWithProgress, answer))
    })

    // Emit if user has completed the lesson
    if ( lessonWithProgress.completed ) {
        emitter.emit(new UserCompletedLesson(user, lessonWithProgress))

        // Emit if user has completed the module
        if ( moduleWithProgress.completed ) {
            emitter.emit(new UserCompletedModule(user, moduleWithProgress))

            // Emit if user has completed the course
            if (courseWithProgress.completed) {
                emitter.emit(new UserCompletedCourse(user, courseWithProgress))
            }
        }
    }


    return lessonWithProgress
}