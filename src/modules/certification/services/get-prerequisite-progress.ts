import { ManagedTransaction } from "neo4j-driver"
import { Course } from "../../../domain/model/course"
import { User } from "../../../domain/model/user";

export type AbridgedCourse = Pick<Course, 'title' | 'link' | 'slug' | 'caption' | 'certification' | 'categories' | 'duration'>

export type PrerequisiteProgress = AbridgedCourse & { progress: number | null }

export async function getPrerequisiteProgress(tx: ManagedTransaction, slug: string, user: User | undefined): Promise<PrerequisiteProgress[]> {
    // Cypher for user progress
    const userWhere = user ? `
      OPTIONAL MATCH (u:User {sub: $sub})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(cc)<-[:HAS_PREREQUISITE]-(c)
      USING INDEX u:User(sub)
      WITH c, u, cc, e,
      COUNT {(e)-[:COMPLETED_LESSON]->()} AS completed,
      COUNT {(cc)-[:HAS_MODULE|HAS_LESSON*2]->(l) WHERE not l:OptionalLesson } AS mandatory
      WITH c, u, cc, CASE WHEN e:CompletedEnrolment THEN 100 WHEN mandatory = 0 THEN 0 ELSE round(100.0 * completed / mandatory, 1) END AS percentage
      WITH c, u, apoc.map.fromPairs(collect([ cc.slug, percentage ])) AS progress
    `: 'WITH c, {} AS progress'

    // Get Prerequisites
    const res = await tx.run<PrerequisiteProgress>(`
      MATCH (c:Course { slug: $slug })

      ${userWhere}

      MATCH(c) - [r: HAS_PREREQUISITE] -> (p)
      WITH * ORDER BY r.order ASC

      RETURN
        p.link AS link,
      p.slug AS slug,
      p.caption AS caption,
      p.title AS title,
      progress[p.slug] AS progress
      `, { slug, sub: user?.sub })

    return res.records.map(record => record.toObject())
}
