import { Transaction } from "neo4j-driver";
import { write } from "../../modules/neo4j";
import { createSandbox, Sandbox } from "../../modules/sandbox";
import { CourseWithProgress } from "../model/course";

export async function createAndSaveSandbox(token: string, course: CourseWithProgress, tx?: Transaction): Promise<Sandbox | undefined> {
    if ( !course.usecase ) {
        return
    }

    // Prefer the DB record?
    if ( process.env.SANDBOX_PREFER_EXISTING && course.sandbox ) {
        return course.sandbox
    }

    const { enrolmentId, usecase, } = course

    const sandboxOutput = await createSandbox(token, usecase)

    const query = `
        MATCH (e:Enrolment {id: $id})
        MERGE (s:Sandbox {id: $sandbox.id})
        SET s += $sandbox,
                s.createdAt = datetime(),
                s.expiresAt = datetime({epochMillis: toInteger($sandbox.expires)}),
                e.lastSeenAt = datetime()
        MERGE (e)-[:HAS_SANDBOX]->(s)
        RETURN s { .* } AS sandbox
    `

    const params = {
        id: enrolmentId,
        sandbox: {
            id: sandboxOutput.sandboxId,
            hashKey: sandboxOutput.sandboxHashKey,
            host: sandboxOutput.host,
            ip: sandboxOutput.ip,
            boltPort: sandboxOutput.boltPort,
            expires: sandboxOutput.expires,
            usecase: sandboxOutput.usecase,
            username: sandboxOutput.username,
            password: sandboxOutput.password,
            scheme: sandboxOutput.scheme,
        }
    }

    const res = tx !== undefined
        ? await tx.run(query, params)
        : await write(query, params)

    return res.records[0].get('sandbox')
}
