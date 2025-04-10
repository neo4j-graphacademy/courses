import { ManagedTransaction } from "neo4j-driver";
import NotFoundError from "../../errors/not-found.error";
import { emitter } from "../../events";
import { notify } from "../../middleware/bugsnag.middleware";
import { writeTransaction } from "../../modules/neo4j";
import { UserEnrolled } from "../events/UserEnrolled";
import { CourseWithProgress, STATUS_DRAFT } from "../model/course";
import { Enrolment } from "../model/enrolment";
import { User } from "../model/user";
import { createAndSaveSandbox } from "./create-and-save-sandbox";
import { appendParams, courseCypher } from "./cypher";

export async function mergeEnrolment(tx: ManagedTransaction, slug: string, user: User, ref: string | undefined, team: string | undefined, allowCertification = true, category?: string) {
    const res = await tx.run<Partial<CourseWithProgress>>(`
        MATCH (c:Course {slug: $slug})
        ${allowCertification ? '' : "WHERE not c.link CONTAINS 'certifications'"}

        MERGE (u:User {sub: $user})
        ON CREATE SET u.id = randomUuid(), u.createdAt = datetime(),
            u.givenName = $givenName,
            u.name = $name,
            u.picture = $picture
        SET u.email = coalesce($email, u.email), u.id = coalesce(u.id, randomUuid()),
            u.refs = CASE WHEN $ref IS NOT NULL THEN apoc.coll.toSet(coalesce(u.refs, []) + $ref)
                ELSE u.refs END,
            u.categories = CASE WHEN $category IS NOT NULL THEN apoc.coll.toSet(coalesce(u.categories, []) + $category) ELSE u.categories END
        MERGE (e:Enrolment {id: apoc.text.base64Encode($slug +'--'+ u.sub)})
        ON CREATE SET e.createdAt = datetime()
        ON MATCH SET e.updatedAt = datetime()
        SET e.lastSeenAt = datetime(),
            e.ref = $ref,
            e.category = $category
        MERGE (u)-[:HAS_ENROLMENT]->(e)
        MERGE (e)-[:FOR_COURSE]->(c)

        FOREACH (slug IN CASE WHEN $category IS NOT NULL THEN [$category] ELSE [] END |
            MERGE (cat:Category {slug: slug})
            MERGE (e)-[:THROUGH_CATEGORY]->(cat)
        )

        REMOVE e:FailedEnrolment
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
        picture: user.picture || null,
        ref: ref || null,
        team: team || null,
        category: category || null,
    }))

    if (res.records.length === 0) {
        throw new NotFoundError(`Could not enrol in course ${slug}.  Course could not could not be found.`)
    }

    return res
}

export async function enrolInCourse(slug: string, user: User, token: string, ref: string | undefined, team?: string, category?: string): Promise<Enrolment> {
    const output = await writeTransaction(async tx => {
        // Save data to database
        const res = await mergeEnrolment(tx, slug, user, ref, team, false, category)

        const enrolment = res.records[0].get('enrolment')

        const course = enrolment.course;

        // Create Sandbox if necessary
        let sandbox
        if (course.usecase) {
            try {
                sandbox = await createAndSaveSandbox(token, enrolment.user, course, tx)
            }
            catch (e: any) {
                // Continue to course, the course will try to
                // create the sandbox further down the line
                notify(e)
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
        emitter.emit(new UserEnrolled(user, output.course, output.sandbox, ref, team))
    }

    return output.enrolment as Enrolment
}
