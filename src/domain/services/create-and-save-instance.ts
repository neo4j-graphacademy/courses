import { Transaction } from "neo4j-driver";
import { write } from "../../modules/neo4j";
import { CourseWithProgress } from "../model/course";
import { User } from "../model/user";
import { Instance } from "../model/instance";
import databaseProvider from "../../modules/instances";

export async function createAndSaveInstance(token: string, user: User, course: CourseWithProgress, tx?: Transaction): Promise<Instance | undefined> {
    if (!course.usecase) {
        return
    }

    // Prefer the DB record?
    if (process.env.SANDBOX_PREFER_EXISTING && course.sandbox) {
        return course.sandbox
    }

    const { enrolmentId, usecase, } = course

    // Create instance provider
    const provider = await databaseProvider(course.databaseProvider)

    const sandboxOutput: Instance = await provider.createInstance(token, user, usecase, course.vectorOptimized, course.graphAnalyticsPlugin)

    if (!sandboxOutput) {
        // Could not create sandbox for some reason
        return
    }

    // TODO: Why is this happening?
    if (!enrolmentId) {
        return sandboxOutput
    }

    const query = `
        MERGE (e:Enrolment {id: $id})
        MERGE (s:Instance {id: $sandbox.id})
        SET s += $sandbox,
                s.createdAt = datetime(),
                s.expiresAt = datetime({epochMillis: toInteger($sandbox.expires)}),
                e.lastSeenAt = datetime()
        MERGE (e)-[:HAS_INSTANCE]->(s)
        RETURN s { .* } AS instance
    `

    const params = {
        id: enrolmentId,
        instance: {
            id: sandboxOutput.sandboxHashKey,
            sandboxId: sandboxOutput.sandboxId,
            sandboxHashKey: sandboxOutput.sandboxHashKey,
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

    type createAndSaveInstanceResult = {
        instance: Instance
    }

    const res = tx !== undefined
        ? await tx.run<createAndSaveInstanceResult>(query, params)
        : await write<createAndSaveInstanceResult>(query, params)

    return res.records[0].get('instance')
}
