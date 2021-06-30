import path from 'path'
import fs from 'fs'
import { getSandboxForUseCase } from "../../modules/sandbox";
import { getLessonDirectory } from '../../modules/asciidoc';
import { ASCIIDOC_DIRECTORY, RESET_CYPHER_FILENAME } from '../../constants';
import { createDriver } from '../../modules/neo4j';
import { Transaction } from 'neo4j-driver';


export async function resetDatabase(token: string, course: string, module: string, lesson: string, usecase: string): Promise<boolean> {
    // Check that a reset.cypher file exists
    const resetFile = path.join(ASCIIDOC_DIRECTORY, getLessonDirectory(course, module, lesson), RESET_CYPHER_FILENAME)

    if ( !fs.existsSync(resetFile) ) {
        return false
    }

    // Check that a sandbox exists
    const sandbox = await getSandboxForUseCase(token, usecase)

    if ( !sandbox ) {
        return false
    }

    // Run the cypher
    const cypher = fs.readFileSync(resetFile).toString()

    const host = `bolt://${sandbox.ip}:${sandbox.boltPort}`
    const { username, password } = sandbox

    const driver = await createDriver(host, username, password)

    const session = driver.session()

    try {
        await session.writeTransaction((tx: Transaction) => tx.run(cypher))
    }
    catch(e) {
        // TODO: Error handling
        console.log(e);

    }

    await session.close()

    return true

}