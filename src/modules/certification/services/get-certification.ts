import { ManagedTransaction } from "neo4j-driver";
import { Course } from "../../../domain/model/course";
import { User } from "../../../domain/model/user";
import NotFoundError from "../../../errors/not-found.error";
import { readTransaction } from "../../neo4j";
import checkExistingAttempts, { CertificationStatus, NextCertificationAction } from "./check-existing-attempts";

type AbridgedCourse = Pick<Course, 'title' | 'link' | 'slug' | 'caption' | 'certification' | 'categories' | 'duration'>

type PrerequisiteProgress = AbridgedCourse & { progress: number | null }

type CertificationResponse = {
  course: AbridgedCourse;

  // Has certification been completed?
  completed: boolean;

  // Has it been failed in the last 24 hours?
  failed: boolean;
  percentage: number | undefined;
  updatedAt: string; // DateTime

  // Is the quiz currently in progress?
  inProgress: boolean;

  // Is quiz available
  available: boolean;

  // Timestamp for when next attempt will be available
  availableAfter: string | undefined;

  // Has the user completed the prerequisites?
  prerequisites: PrerequisiteProgress[]
}

async function getPrerequisiteProgress(tx: ManagedTransaction, slug: string, user: User | undefined): Promise<PrerequisiteProgress[]> {
  // Cypher for user progress
  const userWhere = user ? `
    OPTIONAL MATCH (u:User {sub: $sub})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(cc)<-[:HAS_PREREQUISITE]-(c)
    WITH c, u, cc, e,
    COUNT {(e)-[:COMPLETED_LESSON]->()} AS completed,
    COUNT {(cc)-[:HAS_MODULE|HAS_LESSON*2]->(l) WHERE not l:OptionalLesson } AS mandatory
    WITH c, u, cc, CASE WHEN e:CompletedEnrolment THEN 100 WHEN mandatory = 0 THEN 0 ELSE round(100.0 * completed / mandatory, 1) END AS percentage
    WITH c, u, apoc.map.fromPairs(collect([ cc.slug, percentage ])) AS progress
  `: 'WITH c, {} AS progress'

  // Get Prerequisites
  const res = await tx.run<PrerequisiteProgress>(`
    MATCH (c:Course {slug:  $slug})

    ${userWhere}

    MATCH (c)-[r:HAS_PREREQUISITE]->(p)
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


export default async function getCertification(slug: string, user: User | undefined): Promise<CertificationResponse> {
  const res = await readTransaction<CertificationResponse>(async tx => {
    const res = await tx.run(`
      MATCH (c:Course:Certification {slug: $slug})
      RETURN c {
        .*,
        certification: true,
        categories: [(c)-[:IN_CATEGORY]->(n) | n { .slug, .title }]
      } AS course
    `, { slug })

    if (res.records.length === 0) {
      return undefined
    }

    const course = res.records[0].get('course')

    let attempt: Partial<CertificationStatus> = {}
    let available = false
    let inProgress = false
    let completed = false
    let failed = false


    if (user !== undefined) {
      attempt = await checkExistingAttempts(tx, slug, user)

      completed = attempt.completed === true
      failed = attempt.failed === true
      available = attempt.action === NextCertificationAction.CREATE
      inProgress = attempt.action === NextCertificationAction.CONTINUE
    }

    const prerequisites = await getPrerequisiteProgress(tx, slug, user)

    return {
      course,
      completed,
      failed,
      inProgress,
      available,
      prerequisites,
      ...attempt,
    }
  })

  if (res === undefined) {
    throw new NotFoundError(`Could not find certification ${slug}`)
  }

  return res
}
