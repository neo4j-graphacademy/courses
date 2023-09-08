import { write } from "../../modules/neo4j";
import { Sandbox } from "../model/sandbox";
import { User } from "../model/user";

export default async function saveSandboxError(user: User, course: string, module: string, lesson: string, sandbox: Sandbox, error: Error): Promise<void> {
    // Save to db
    await write(`
                MATCH (u:User {sub: $sub})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c:Course {slug: $course}),
                    (c)-[:HAS_MODULE]->(m:Module {slug: $module})-[:HAS_LESSON]->(l:Lesson {slug: $lesson})

                MERGE (s:Sandbox {id: $sandbox.sandboxHashKey})
                ON CREATE SET s += $sandbox
                MERGE (e)-[:HAS_SANDBOX]->(s)

                CREATE (se:SandboxError {
                    createdAt: datetime(),
                    type: $type,
                    message: $message
                })
                CREATE (u)-[:EXPERIENCED_ERROR]->(se)
                MERGE (se)-[:ON_SANDBOX]->(s)
                MERGE (se)-[:AFFECTED_ENROLMENT]->(e)
                MERGE (se)-[:AFFECTED_LESSON]->(l)
            `, {
        sub: user.sub,
        course, module, lesson,
        type: error.name,
        message: error.message,
        sandbox,
    })
}
