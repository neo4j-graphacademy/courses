import { getSandboxForUseCase } from "../../modules/sandbox";
import { createDriver } from '../../modules/neo4j';
import { notify } from '../../middleware/bugsnag.middleware';
import { getLessonCypherFile } from '../../utils';
import { User } from "../model/user";

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

    const driver = await createDriver(host, username, password)

    const session = driver.session()

    const parts = cypher.split(';')
        .filter(e => e.trim() !== '')

    for (const part of parts) {
        try {
            await session.executeWrite(async tx => tx.run(part))
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
                    instance: (driver as any)['_address'],
                    query: cypher,
                })
            })


        }
    }

    await session.close()

    return true
}
