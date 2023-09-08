import { Driver } from 'neo4j-driver'
import { getSandboxForUseCase } from "../../modules/sandbox";
import { createDriver } from '../../modules/neo4j';
import { notify } from '../../middleware/bugsnag.middleware';
import { getLessonCypherFile } from '../../utils';
import { User } from "../model/user";
import saveSandboxError from './save-sandbox-error';

export async function resetDatabase(token: string, user: User, course: string, module: string, lesson: string, usecase: string): Promise<boolean> {
    // Check that a reset.cypher file exists
    const cypher = await getLessonCypherFile(course, module, lesson, 'reset')

    if (!cypher) {
        return false
    }

    // Check that a sandbox exists
    const sandbox = await getSandboxForUseCase(token, user, usecase)

    if (!sandbox) {
        return false
    }

    const host = `bolt://${sandbox.ip}:${sandbox.boltPort}`
    const { username, password } = sandbox

    let driver = await createDriver(host, username, password, false)
    try {
        await driver.verifyConnectivity()

        const session = driver.session()

        const parts = cypher.split(';')
            .filter(e => e.trim() !== '')

        for (const part of parts) {
            await session.executeWrite(async tx => tx.run(part))
        }

        await driver.close()
    }
    catch (e: any) {
        notify(e, event => {
            event.addMetadata('course', {
                course,
                module,
                lesson,
                usecase,
            })

            event.addMetadata('query', {
                instance: { host, username, password },
                type: 'reset',
                query: cypher,
            })

            // Save to db
            void saveSandboxError(user, course, module, lesson, sandbox, e)
        })

        return false
    }
    finally {
        await driver.close()
    }

    return true
}
