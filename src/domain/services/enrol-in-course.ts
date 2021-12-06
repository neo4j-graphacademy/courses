import NotFoundError from "../../errors/not-found.error";
import { emitter } from "../../events";
import { notify } from "../../middleware/bugsnag";
import { write, writeTransaction } from "../../modules/neo4j";
import { createSandbox } from "../../modules/sandbox";
import { UserEnrolled } from "../events/UserEnrolled";
import { STATUS_DRAFT } from "../model/course";
import { Enrolment } from "../model/enrolment";
import { User } from "../model/user";
import { createAndSaveSandbox } from "./create-and-save-sandbox";
import { appendParams, courseCypher } from "./cypher";

export async function enrolInCourse(slug: string, user: User, token: string): Promise<Enrolment> {
    const output = await writeTransaction(async tx => {
        const res = await tx.run(`
            MATCH (c:Course {slug: $slug})
            WHERE (NOT c.status in [ $draft ] + $exclude) OR $email ENDS WITH '@neotechnology.com'
            MERGE (u:User {sub: $user})
            ON CREATE SET u.createdAt = datetime(),
                u.givenName = $givenName,
                u.name = $name,
                u.picture = $picture
            SET u.email = coalesce($email, u.email), u.id = coalesce(u.id, randomUuid())

            MERGE (e:Enrolment {id: apoc.text.base64Encode($slug +'--'+ u.sub)})
            ON CREATE SET e.createdAt = datetime()
            ON MATCH SET e.updatedAt = datetime()
            SET e.lastSeenAt = datetime()

            MERGE (u)-[:HAS_ENROLMENT]->(e)
            MERGE (e)-[:FOR_COURSE]->(c)

            RETURN {
                user: {
                    id: u.id
                },
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
        }))

        if (res.records.length === 0) {
            throw new NotFoundError(`Could not enrol in course ${slug}.  Course could not could not be found.`)
        }

        const enrolment = res.records[0].get('enrolment')

        const course = enrolment.course;

        let sandbox

        // Create and save sandbox details
        if (course.usecase && !enrolment.sandbox) {
            try {
                sandbox = await createAndSaveSandbox(token, course, tx)
            }
            catch (e: any) {
                notify(e, event => {
                    event.setUser(user.id, user.email, user.name)

                    event.addMetadata('request', {
                        data: e.request.data,
                        headers: e.request.headers,
                        status: e.request.status,
                        statusText: e.request.statusText,
                    })
                    event.addMetadata('response', {
                        data: e.response.data,
                        headers: e.response.headers,
                        status: e.response.status,
                        statusText: e.response.statusText,
                    })
                })
            }
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

    return output.enrolment
}
