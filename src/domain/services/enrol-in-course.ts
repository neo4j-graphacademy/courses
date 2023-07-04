import NotFoundError from "../../errors/not-found.error";
import { emitter } from "../../events";
import { writeTransaction } from "../../modules/neo4j";
import { UserEnrolled } from "../events/UserEnrolled";
import { STATUS_DRAFT } from "../model/course";
import { Enrolment } from "../model/enrolment";
import { User } from "../model/user";
import { createAndSaveSandbox } from "./create-and-save-sandbox";
import { appendParams, courseCypher } from "./cypher";

export async function enrolInCourse(slug: string, user: User, token: string, ref: string | undefined): Promise<Enrolment> {
    const output = await writeTransaction(async tx => {
        // Save data to database
        const res = await tx.run(`
            MATCH (c:Course {slug: $slug})
            MERGE (u:User {sub: $user})
            ON CREATE SET u.createdAt = datetime(),
                u.givenName = $givenName,
                u.name = $name,
                u.picture = $picture
            SET u.email = coalesce($email, u.email), u.id = coalesce(u.id, randomUuid()),
                u.refs = CASE WHEN $ref IS NOT NULL THEN apoc.coll.toSet(coalesce(u.refs, []) + $ref)
                    ELSE u.refs END
            MERGE (e:Enrolment {id: apoc.text.base64Encode($slug +'--'+ u.sub)})
            ON CREATE SET e.createdAt = datetime(), e.certificateId = randomUuid()
            ON MATCH SET e.updatedAt = datetime()
            SET e.lastSeenAt = datetime(),
                e.ref = $ref
            MERGE (u)-[:HAS_ENROLMENT]->(e)
            MERGE (e)-[:FOR_COURSE]->(c)
            RETURN {
                user: {
                    id: u.id
                } AS user,
                id: e.id,
                sandbox: [ (e)-[:HAS_SANDBOX]->(s) | s ][0],
                course: ${courseCypher('e', 'u')},
                createdAt: e.createdAt,
                updatedAt: e.updatedAt
            } AS enrolment
        `, appendParams({
            draft: STATUS_DRAFT,
            slug,
            user: user.sub,
            name: user.nickname || user.name,
            email: user.email,
            givenName: user.name,
            picture: user.picture,
            ref: ref || null,
        }))

        if (res.records.length === 0) {
            throw new NotFoundError(`Could not enrol in course ${slug}.  Course could not could not be found.`)
        }

        const enrolment = res.records[0].get('enrolment')
        const dbUser = res.records[0].get('user')

        const course = enrolment.course;

        // Create Sandbox if necessary
        let sandbox
        if (course.usecase) {
            sandbox = await createAndSaveSandbox(token, dbUser, course, tx)
        }

        return {
            user,
            enrolment,
            course,
            sandbox,
        }
    })

    // Emit event
    if (output.enrolment.updatedAt === null) {
        emitter.emit(new UserEnrolled(user, output.course, output.sandbox))
    }

    return output.enrolment as Enrolment
}
