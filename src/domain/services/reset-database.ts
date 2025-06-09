import databaseProvider, { DatabaseProvider } from "../../modules/instances";
import { getLessonCypherFile } from '../../utils';
import { User } from "../model/user";


export async function resetDatabase(token: string, user: User, course: string, module: string, lesson: string, sourceDatabaseProvider: DatabaseProvider, usecase: string): Promise<boolean> {
    // Check that a reset.cypher file exists
    const cypher = await getLessonCypherFile(course, module, lesson, 'reset')

    if (!cypher) {
        return false
    }

    // Check that a sandbox exists
    const provider = databaseProvider(sourceDatabaseProvider)

    const res = await provider.executeCypher(token, user, usecase, cypher, {}, 'WRITERS')

    return res ? true : false;
}
