import NotFoundError from "../../errors/not-found.error";
import { emitter } from "../../events";
import { write } from "../../modules/neo4j";
import { createSandbox } from "../../modules/sandbox";
import { UserEnrolled } from "../events/UserEnrolled";
import { Enrolment } from "../model/enrolment";
import { User } from "../model/user";
import { appendParams, courseCypher } from "./cypher";

export async function enrolInCourse(slug: string, user: User, token: string): Promise<Enrolment> {
    const res = await write(`
        MATCH (c:Course {slug: $slug})
        MERGE (u:User {sub: $user})
        ON CREATE SET u.id = randomUuid(), u.createdAt = datetime(),
            u.givenName = $givenName,
            u.name = $name,
            u.picture = $picture
        SET u.email = coalesce($email, u.email)

        MERGE (e:Enrolment {id: apoc.text.base64Encode($slug +'--'+ u.sub)})
        ON CREATE SET e.createdAt = datetime()

        MERGE (u)-[:HAS_ENROLMENT]->(e)
        MERGE (e)-[:FOR_COURSE]->(c)

        RETURN {
            user: {
                id: u.id
            },
            course: ${courseCypher('e', 'u')},
            createdAt: e.createdAt
        } AS enrolment
    `, appendParams({
        slug,
        user: user.sub,
        name: user.nickname || user.name,
        email: user.email,
        givenName: user.name,
        picture: user.picture,
    }))

    if ( res.records.length === 0 ) {
        throw new NotFoundError(`Course ${slug} could not be found`)
    }

    const enrolment = res.records[0].get('enrolment')

    const course = enrolment.course;

    let sandbox

    if (course.usecase) {
        sandbox = await createSandbox(token, course.usecase)
    }

    // Emit event
    emitter.emit(new UserEnrolled(user, course, sandbox))

    return enrolment
}
