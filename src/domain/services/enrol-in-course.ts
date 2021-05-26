import NotFoundError from "../../errors/not-found.error";
import { emitter } from "../../events";
import { write } from "../../modules/neo4j";
import { UserEnrolled } from "../events/UserEnrolled";
import { Enrolment } from "../model/enrolment";
import { User } from "../model/user";
import { courseCypher } from "./cypher";

export async function enrolInCourse(slug: string, user: User): Promise<Enrolment> {
    const res = await write(`
        MATCH (c:Course {slug: $slug})
        MERGE (u:User {oauthId: $user})
        ON CREATE SET u.id = randomUuid(), u.createdAt = datetime(),
            u.givenName = $givenName,
            u.name = $name

        MERGE (e:Enrolment {id: apoc.text.base64Encode($slug +'--'+ u.id)})
        ON CREATE SET e.createdAt = datetime()

        MERGE (u)-[:HAS_ENROLMENT]->(e)
        MERGE (e)-[:FOR_COURSE]->(c)

        RETURN {
            user: {
                id: u.id
            },
            course: ${courseCypher('e')},
            createdAt: e.createdAt
        } AS enrolment
    `, {
        slug,
        user: user.user_id,
        name: user.name,
        givenName: user.name,
    })

    if ( res.records.length === 0 ) {
        throw new NotFoundError(`Course ${slug} could not be found`)
    }

    const enrolment = res.records[0].get('enrolment')

    const course = enrolment.course;

    // Emit event
    emitter.emit(new UserEnrolled(user, course))

    return enrolment
}
