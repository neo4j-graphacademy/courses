import databaseProvider, { DatabaseProvider } from "../../modules/instances";
import { getLessonCypherFile } from '../../utils';
import { User } from "../model/user";

export async function resetDatabase(token: string, user: User, course: string, module: string, lesson: string, sourceDatabaseProvider: DatabaseProvider, usecase: string): Promise<boolean> {
    // Check that a reset.cypher file exists
    const cypher = await getLessonCypherFile(course, module, lesson, 'reset')

    console.log(cypher)
    if (!cypher) {
        return false
    }


    // Check that a sandbox exists
    const provider = databaseProvider(sourceDatabaseProvider)
    console.log(cypher, provider)

    const res = await provider.executeCypher(token, user, usecase, cypher, {}, 'WRITE')

    console.log(res)

    return res ? true : false;
}
