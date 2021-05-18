import NotFoundError from "../../errors/not-found.error";
import { write } from "../../modules/neo4j";
import { LessonWithProgress } from "../model/lesson";
import { User } from "../model/user";

export async function markAsRead(user: User, course: string, module: string, lesson: string): Promise<LessonWithProgress> {
    const res = await write(`
        MATCH (c:Course)-[:HAS_MODULE]->(m)-[:HAS_LESSON]->(l)
        WHERE c.slug = $course AND m.slug = $module AND l.slug = $lesson AND size((l)-[:HAS_QUESTION]->()) = 0

        MATCH (u:User {oauthId: $user})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c)

        MERGE (e)-[r:COMPLETED_LESSON]->(l)
        SET r.markAsRead = true

        // Has the module been completed?
        WITH c, m, l, e, size((m)-[:HAS_LESSON]->(l)) AS lessons, size((e)-[:COMPLETED_LESSON]->(l)) as completed

        FOREACH (_ IN CASE WHEN lessons = completed THEN [1] ELSE [] END |
            MERGE (e)-[:COMPLETED_MODULE]->(m)
        )

        WITH c, m, l, e, size((c)-[:HAS_MODULE]->(l)) AS modules, size((e)-[:COMPLETED_MODULE]->(l)) as completed

        FOREACH (_ IN CASE WHEN modules = completed THEN [1] ELSE [] END |
            SET e:CompletedEnrolment,
                e.completedAt = coalesce(e.completedAt, datetime())
        )

        RETURN l {
            .*,
            completed: exists((e)-[:COMPLETED_LESSON]->(l)),
            link: '/courses/'+ c.slug +'/'+ m.slug +'/'+ l.slug,
            next: [ (l)-[:NEXT_LESSON]->(next)<-[:HAS_LESSON]-(nm) | next { .slug, .title, link: '/courses/'+ c.slug + '/'+ nm.slug +'/'+ next.slug } ][0],
            questions: [(l)-[:HAS_QUESTION]->(q) | q { .id, .slug }]
        } AS l
    `, {
        user: user.user_id,
        course,
        module,
        lesson,
    })

    if ( !res.records.length ) {
        throw new NotFoundError(`User ${user.user_id} not enrolled to ${course}`)
    }

    return res.records[0].get('l')

}