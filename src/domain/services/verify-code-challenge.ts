import { Transaction } from "neo4j-driver";
import { createDriver } from "../../modules/neo4j";
import { getSandboxForUseCase } from "../../modules/sandbox";
import { getLessonCypherFile } from "../../utils";
import { LessonWithProgress } from "../model/lesson";
import { User } from "../model/user";
import { getCourseWithProgress } from "./get-course-with-progress";
import { saveLessonProgress } from "./save-lesson-progress";

export async function verifyCodeChallenge(user: User, token: string, course: string, module: string, lesson: string): Promise<LessonWithProgress | false> {
    const progress = await getCourseWithProgress(course, user)
    const { usecase } = progress
    const verify = await getLessonCypherFile(course, module, lesson, 'verify')

    // No usecase or verify?
    if ( usecase === undefined || verify === undefined ) {
        return false
    }

    // No sandbox? Return false
    const sandbox = await getSandboxForUseCase(token, usecase)

    if ( !sandbox ) {
        return false
    }

    const host = `bolt://${sandbox.ip}:${sandbox.boltPort}`
    const { username, password } = sandbox

    const driver = await createDriver(host, username, password)

    const session = driver.session()

    const res = await session.readTransaction((tx: Transaction) => tx.run(verify))

    let correct = false

    // If no records are returned then the test has failed
    if ( res.records.length > 0 ) {
        // If there is no outcome column then the test has failed
        if ( res.records[0].has('outcome') ) {
            correct = res.records[0].get('outcome')
        }
    }

    // Save outcome
    const output = await saveLessonProgress(user, course, module, lesson, [ {
        id: '_challenge',
        correct,
        answers: [ verify ]
    } ], token)

    return output
}