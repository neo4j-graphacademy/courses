import { notify } from "../../middleware/bugsnag.middleware";
import { createDriver } from "../../modules/neo4j";
import databaseProvider, { DatabaseProvider } from "../../modules/instances";
import { getLessonCypherFile } from "../../utils";
import { LessonWithProgress } from "../model/lesson";
import { Answer } from "../model/answer";
import { User } from "../model/user";
import { getCourseWithProgress } from "./get-course-with-progress";
import { saveLessonProgress } from "./save-lesson-progress";
import saveSandboxError from "./save-sandbox-error";

function createAnswer(id: string, reason: string | string[], answers: string[] = [], correct = false): Answer[] {
    return [{
        id,
        correct,
        answers,
        reason,
    }]
}


export async function verifyCodeChallenge(user: User, token: string, course: string, module: string, lesson: string): Promise<LessonWithProgress | false> {
    const progress = await getCourseWithProgress(course, user)
    const { usecase } = progress
    const verify = await getLessonCypherFile(course, module, lesson, 'verify')

    // Get Lesson Question ID
    const moduleData = progress.modules.find(item => item.slug === module)
    const lessonData = moduleData?.lessons.find(item => item.slug === lesson)
    const questionId = lessonData?.questions[0]?.slug || '_challenge'

    // No sandbox? Return false
    const provider = databaseProvider(progress.databaseProvider)
    const sandbox = usecase ? await provider.getInstanceForUseCase(token, user, usecase) : undefined

    // Answer array
    let answers: Answer[] = createAnswer(questionId, 'Internal Server Error: unknown')

    // No usecase or verify?
    if (usecase === undefined) {
        answers = createAnswer(questionId, `Internal Server Error: Could not find usecase`)
    }
    else if (verify === undefined) {
        answers = createAnswer(questionId, `Internal Server Error: Could not find verification Cypher`)
    }
    else if (!sandbox) {
        answers = createAnswer(questionId, `Internal Server Error: Could not find sandbox for usecase ${usecase}`)
    }
    else {
        const host = `bolt://${sandbox.ip}:${sandbox.boltPort}`
        const { username, password } = sandbox

        const driver = await createDriver(host, username, password, false)

        try {
            await driver.verifyConnectivity()
            const session = driver.session()

            const res = await session.executeRead(tx => tx.run(verify))

            // If no records are returned then the test has failed
            if (res.records.length > 0) {
                const values = res.records.map(row => ({
                    id: row.has('task') ? row.get('task') : 'verify',
                    correct: row.get('outcome'),
                    answers: row.has('answers') ? row.get('answers') as string[] : null,
                    reason: row.has('reason') ? row.get('reason') : null,
                }))

                const passed = values.every(point => point.correct)
                const actuals = values.map(value => `${value.id}: ${value.answers ? JSON.stringify(value.answers) : '(unknown)'}`)
                const reason = values.filter(value => value.reason)
                    .map(value => value.reason as string)

                answers = createAnswer(questionId, reason, actuals, passed)
            }
            else {
                answers = createAnswer(questionId, `No rows returned by verification Cypher`)
            }
        }
        catch (e: any) {
            notify(e, error => {
                error.addMetadata('sandbox', {
                    host,
                    username,
                })
                error.addMetadata('course', {
                    course,
                    module,
                    lesson,
                    usecase,
                })
                error.addMetadata('query', {
                    instance: (driver as any)['_address'],
                    type: 'verify',
                    query: verify,
                })
                error.setUser(user.sub, user.email, user.name)
            })

            // Save to db
            void saveSandboxError(user, course, module, lesson, sandbox, e)

            answers = createAnswer(questionId, `Internal Server Error: ${e.message}`)
        }
        finally {
            await driver.close()
        }
    }

    // Save outcome
    const output = await saveLessonProgress(user, course, module, lesson, answers, token)


    const reset = await getLessonCypherFile(course, module, lesson, 'reset')

    return {
        ...output,
        reset: reset !== undefined,
    }
}
