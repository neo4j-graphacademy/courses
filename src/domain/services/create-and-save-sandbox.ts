import { write } from "../../modules/neo4j";
import { createSandbox, Sandbox } from "../../modules/sandbox";

export async function createAndSaveSandbox(token: string, usecase: string, enrolmentId: string): Promise<Sandbox> {
    const sandboxOutput = await createSandbox(token, usecase)

    const res = await write(`
        MATCH (e:Enrolment {id: $id})
        MERGE (s:Sandbox {id: toInteger($sandbox.id)})
        SET s += $sandbox,
                s.createdAt = datetime(),
                s.expiresAt = datetime({epochMillis: toInteger($sandbox.expires)})
        MERGE (e)-[:HAS_SANDBOX]->(s)
        RETURN s { .* } AS sandbox
    `, { id: enrolmentId, sandbox: {
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
    } })

    return res.records[0].get('sandbox')
}
