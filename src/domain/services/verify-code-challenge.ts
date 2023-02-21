import { ManagedTransaction } from "neo4j-driver";
import { notify } from "../../middleware/bugsnag.middleware";
import { createDriver } from "../../modules/neo4j";
import { getSandboxForUseCase } from "../../modules/sandbox";
import { getLessonCypherFile } from "../../utils";
import { LessonWithProgress } from "../model/lesson";
import { Answer } from "../model/answer";
import { User } from "../model/user";
import { getCourseWithProgress } from "./get-course-with-progress";
import { saveLessonProgress } from "./save-lesson-progress";



export async function verifyCodeChallenge(user: User, token: string, course: string, module: string, lesson: string): Promise<LessonWithProgress | false> {
    const progress = await getCourseWithProgress(course, user)
    const { usecase } = progress
    const verify = await getLessonCypherFile(course, module, lesson, 'verify')

    // No usecase or verify?
    if (usecase === undefined || verify === undefined) {
        return false
    }

    // No sandbox? Return false
    const sandbox = await getSandboxForUseCase(token, user, usecase)

    if (!sandbox) {
        return false
    }

    const host = `bolt://${sandbox.ip}:${sandbox.boltPort}`
    const { username, password } = sandbox

    const driver = await createDriver(host, username, password)

    const session = driver.session()

    let answers: Answer[] = []

    try {
        const res = await session.executeRead(tx => tx.run(verify))

        // If no records are returned then the test has failed
        if (res.records.length > 0) {
            answers = res.records.map(row => ({
                id: row.has('task') ? row.get('task') : 'verify',
                correct: row.get('outcome'),
                answers: row.has('answers') ? row.get('answers') as string[] : null,
                reason: row.has('reason') ? row.get('reason') : null,
            }))
        }
    }
    catch (e: any) {
        notify(e, error => {
            error.setUser(user.sub, user.email, user.name)
        })

        answers = [{
            id: 'verify',
            correct: false,
            answers: null,
            reason: `Internal Server Error: ${e.message}`,
        }]

    }

    // Save outcome
    const output = await saveLessonProgress(user, course, module, lesson, answers, token)

    return output
}
