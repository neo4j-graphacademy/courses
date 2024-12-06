import { ManagedTransaction } from "neo4j-driver";
import { User } from "../../../domain/model/user";
import { writeTransaction } from "../../neo4j";
import { mergeEnrolment } from "../../../domain/services/enrol-in-course";
import { emitter } from "../../../events";
import { UserEnrolled } from "../../../domain/events/UserEnrolled";
import checkExistingAttempts, { NextCertificationAction } from "./check-existing-attempts";


// Is there an active attempt?
// Is there an attempt within the last 24 hours?
export async function createAttempt(tx: ManagedTransaction, slug: string, user: User, ref: string | undefined, team: string | undefined): Promise<{ enrolmentId: string, attemptId: string, questions: number }> {
  // Merge (u)-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c)
  const enrolmentRes = await mergeEnrolment(tx, slug, user, ref, team, true)
  const enrolment = enrolmentRes.records[0].get('enrolment')

  // Emit event
  emitter.emit(new UserEnrolled(user, enrolment.course, undefined, ref, team))

  // Create (e)-[:HAS_ATTEMPT]->(a)
  // Create (a)-[:ASSIGNED_QUESTION]->(q)

  const attemptRes = await tx.run<{ id: string, questions: number }>(`
      MATCH (e:Enrolment {id: $enrolmentId})-[:FOR_COURSE]->(c)
      CREATE (a:CertificationAttempt {
        id: randomUuid(),
        createdAt: datetime(),
        expiresAt: datetime() + duration(
          'PT' +
          coalesce(
            split(c.duration, ' ')[0]
            + left(split(c.duration, ' ')[1], 1)
          , '30M')
        )
      })
      CREATE (e)-[:HAS_ATTEMPT]->(a)

      WITH a

      CALL {
        WITH a

        // Get Question Bank
        MATCH (c:Certification {slug: $slug})-[:HAS_QUESTION]->(q)-[:IN_CATEGORY]->(qc)

        // Randomise order
        WITH a, c, q, qc ORDER BY rand()

        // Group by category
        WITH a, c, qc.slug AS category, collect(q) AS questions

        // Group by category and level
        WITH a, c, category, [ n in range(0, 3) | [ q in questions where q.level = n | q ] ] AS questions, apoc.map.fromPairs([ (c)-[w:HAS_QUESTION_WEIGHTING]-(n) | [ n.slug, w.weights ] ]) AS weights

        UNWIND range(1, 3) AS level

        // Get total number for category/level
        WITH a, c, weights, category, level, questions, weights[category][level] AS take

        // Get first n from question
        WITH a, c, weights, category, [ idx in range(0, take-1) | questions[level][idx] ] AS selected

        UNWIND selected AS question

        CREATE (a)-[:ASSIGNED_QUESTION]->(question)
        RETURN count(*) AS questions
      }

      RETURN a.id AS id, questions
    `, {
    slug,
    enrolmentId: enrolment.id,
  })

  return {
    enrolmentId: enrolment.id,
    attemptId: attemptRes.records[0].get('id'),
    questions: attemptRes.records[0].get('questions'),
  }
}

type StartCertificationOutput = { action: NextCertificationAction, attemptId: string | undefined }

export default async function startCertification(slug: string, user: User, ref: string | undefined, team: string | undefined): Promise<StartCertificationOutput> {
  return writeTransaction<StartCertificationOutput>(
    async tx => {
      const { action } = await checkExistingAttempts(tx, slug, user)

      if (action == NextCertificationAction.CREATE) {
        const { attemptId } = await createAttempt(tx, slug, user, ref, team)

        return {
          action,
          attemptId,
        }
      }

      return {
        action: action,
        attemptId: undefined,
      }
    })
}
