import { getSandboxForUseCase } from "../../modules/sandbox";
import { createDriver } from '../../modules/neo4j';
import { Transaction } from 'neo4j-driver';
import { notify } from '../../middleware/bugsnag.middleware';
import { getLessonCypherFile } from '../../utils';


export async function resetDatabase(token: string, course: string, module: string, lesson: string, usecase: string): Promise<boolean> {
    // Check that a reset.cypher file exists
    const cypher = await getLessonCypherFile(course, module, lesson, 'reset')

    if (!cypher) {
        return false
    }

    // Check that a sandbox exists
    const sandbox = await getSandboxForUseCase(token, usecase)

    if (!sandbox) {
        return false
    }

    const host = `bolt://${sandbox.ip}:${sandbox.boltPort}`
    const { username, password } = sandbox

    const driver = await createDriver(host, username, password)

    const session = driver.session()

    const parts = cypher.split(';')
        .filter(e => e !== '')

    for (const part of parts) {
        try {
            await session.writeTransaction(async (tx: Transaction) => tx.run(part))
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
                    // @ts-ignore
                    // tslint:disable-next-line no-string-literal
                    instance: _driver['_address'],
                    query: cypher,
                })
            })


        }
    }

    await session.close()

    return true

}