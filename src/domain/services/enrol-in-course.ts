import NotFoundError from "../../errors/not-found.error";
import { emitter, EVENT_USER_ENROLLED } from "../../events";
import { write } from "../../modules/neo4j";
import { Enrolment } from "../model/enrolment";
import { User } from "../model/user";

export async function enrolInCourse(slug: string, user: User): Promise<Enrolment> {
    const res = await write(`
        MATCH (c:Course {slug: $slug})
        MERGE (u:User {id: $user})
        MERGE (e:Enrolment {id: apoc.text.base64Encode($slug +'--'+ $user)})
        ON CREATE SET e.createdAt = datetime()

        MERGE (u)-[:HAS_ENROLMENT]->(e)
        MERGE (e)-[:FOR_COURSE]->(c)

        RETURN {
            user: {
                id: u.id
            },
            course: {
                slug: c.slug,
                usecase: c.usecase
            },
            createdAt: e.createdAt
        } AS enrolment
    `, {
        slug,
        user: user.user_id,
    })

    if ( res.records.length === 0 ) {
        throw new NotFoundError(`Course ${slug} could not be found`)
    }

    const enrolment = res.records[0].get('enrolment')

    // Emit event
    emitter.emit<Enrolment>(EVENT_USER_ENROLLED, enrolment)

    return enrolment
}
