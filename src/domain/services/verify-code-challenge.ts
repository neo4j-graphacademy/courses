import { notify } from "../../middleware/bugsnag.middleware";
import { createDriver } from "../../modules/neo4j";
import { getSandboxForUseCase } from "../../modules/sandbox";
import { getLessonCypherFile } from "../../utils";
import { LessonWithProgress } from "../model/lesson";
import { Answer } from "../model/answer";
import { User } from "../model/user";
import { getCourseWithProgress } from "./get-course-with-progress";
import { saveLessonProgress } from "./save-lesson-progress";

function createAnswer(reason: string | string[], answers: string[] = [], correct = false): Answer[] {
    return [{
        id: 'verify',
        correct,
        answers,
        reason,
    }]
}


export async function verifyCodeChallenge(user: User, token: string, course: string, module: string, lesson: string): Promise<LessonWithProgress | false> {
    const progress = await getCourseWithProgress(course, user)
    const { usecase } = progress
    const verify = await getLessonCypherFile(course, module, lesson, 'verify')

    // No sandbox? Return false
    const sandbox = usecase ? await getSandboxForUseCase(token, user, usecase) : undefined

    // Answer array
    let answers: Answer[] = createAnswer('Internal Server Error: unknown')

    console.log(usecase, sandbox);

    // No usecase or verify?
    if (usecase === undefined) {
        answers = createAnswer(`Internal Server Error: Could not find usecase`)
    }
    else if (verify === undefined) {
        answers = createAnswer(`Internal Server Error: Could not find verification Cypher`)
    }
    else if (!sandbox) {
        answers = createAnswer(`Internal Server Error: Could not find sandbox for usecase ${usecase}`)
    }
    else {
        const host = `bolt://${sandbox.ip}:${sandbox.boltPort}`
        const { username, password } = sandbox

        const driver = await createDriver(host, username, password)
        const session = driver.session()

        try {
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
                const actuals = values.map(value => `${value.id}: ${value.answers ? JSON.stringify(value.answers) : '(unknown'}`)
                const reason = values.filter(value => value.reason)
                    .map(value => value.reason as string)

                answers = createAnswer(reason, actuals, passed)
            }
            else {
                answers = createAnswer(`No rows returned by verification Cypher`)
            }
        }
        catch (e: any) {
            notify(e, error => {
                error.setUser(user.sub, user.email, user.name)
            })

            answers = createAnswer(`Internal Server Error: ${e.message}`)
        }
    }

    // Save outcome
    const output = await saveLessonProgress(user, course, module, lesson, answers, token)

    return output
}
