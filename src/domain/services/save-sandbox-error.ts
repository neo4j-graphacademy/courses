import { write } from "../../modules/neo4j";
import { Instance } from "../model/instance";
import { User } from "../model/user";

export default async function saveSandboxError(user: User, course: string, module: string, lesson: string, instance: Instance, error: Error): Promise<void> {
    // Save to db
    await write(`
                MATCH (u:User {sub: $sub})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c:Course {slug: $course}),
                    (c)-[:HAS_MODULE]->(m:Module {slug: $module})-[:HAS_LESSON]->(l:Lesson {slug: $lesson})

                MERGE (s:Instance {id: $instance.id})
                ON CREATE SET s += $instance
                MERGE (e)-[:HAS_INSTANCE]->(s)

                CREATE (se:SandboxError {
                    createdAt: datetime(),
                    type: $type,
                    message: $message
                })
                CREATE (u)-[:EXPERIENCED_ERROR]->(se)
                MERGE (se)-[:ON_INSTANCE]->(s)
                MERGE (se)-[:AFFECTED_ENROLMENT]->(e)
                MERGE (se)-[:AFFECTED_LESSON]->(l)
            `, {
        sub: user.sub,
        course, module, lesson,
        type: error.name,
        message: error.message,
        instance,
    })
}
