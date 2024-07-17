import { ManagedTransaction } from "neo4j-driver";
import { User } from "../../../domain/model/user";
import { writeTransaction } from "../../neo4j";
import checkExistingAttempts, { CertificationQuestion, CertificationStatus, NextCertificationAction } from "./check-existing-attempts";
import NotFoundError from "../../../errors/not-found.error";
import markAsCompleted from "./mark-as-completed";
import { emitter } from "../../../events";
import { UserCompletedCourse } from "../../../domain/events/UserCompletedCourse";
import { Course } from "../../../domain/model/course";

export default function saveAnswer(slug: string, user: User, questionId: string, answers: string[]): Promise<CertificationStatus> {
  return writeTransaction(async (tx: ManagedTransaction) => {
    // Check status
    const status = await checkExistingAttempts(tx, slug, user)

    if (status.action !== NextCertificationAction.CONTINUE) {
      return status
    }

    // Save attempt: (a)-[:PROVIDED_ANSWER {correct: boolean}]->(q)
    const answerRes = await tx.run<{ continue: boolean }>(`
      MATCH (a:CertificationAttempt {id: $attemptId})
      MATCH (q:CertificationQuestion {id: $questionId})

      MERGE (a)-[r:PROVIDED_ANSWER]->(q)
      SET
        a.updatedAt = datetime(),
        r.answers = $answers,
        r.createdAt = datetime(),
        r.correct = size($answers) = size(q.correct)
          AND all(answer in $answers where answer in q.correct)
          AND all(answer in q.correct where answer in $answers)

      RETURN
        q.correct AS correct,
        r.answers AS answers,
        r.correct AS provided,
        size($answers) = size(q.correct) AS size,
        all(answer in $answers where answer in q.correct) AS a,
        all(answer in q.correct where answer in $answers) AS b,

        COUNT { (a)-[:ASSIGNED_QUESTION]->() } > COUNT { (a)-[:PROVIDED_ANSWER]->() } AS continue

    `, { attemptId: status.id, questionId, answers, })

    // Has the user finished?
    if (answerRes.records.length === 0) {
      throw new NotFoundError(`Question ${questionId} could not be found`)
    }

    const shouldContinue = answerRes.records[0].get('continue')

    // User has run out of questions
    if (status.id && shouldContinue === false) {
      await markAsCompleted(tx, status.id)

      emitter.emit(new UserCompletedCourse(
        user,
        status.course as Partial<Course>,
        undefined
      ))

      return {
        action: NextCertificationAction.COMPLETE,
      }
    }

    // Shall we continue with the next question?
    const questionRes = await tx.run<CertificationQuestion>(`
      MATCH (a:CertificationAttempt {id: $attemptId})-[:ASSIGNED_QUESTION]->(q)-[:IN_CATEGORY]->(c)
      WHERE not (a)-[:PROVIDED_ANSWER]->(q)
      RETURN q {
          .*,
          category: [ (q)-[:IN_CATEGORY]->(c) | c { .slug, .title } ][0]
        } AS question
      ORDER BY c.order ASC, q.level ASC, rand() ASC LIMIT 1
    `, { attemptId: status.id })

    if (questionRes.records.length === 0) {
      return {
        action: NextCertificationAction.COMPLETE,
      }
    }

    const question = questionRes.records[0].toObject()

    return {
      ...status,
      action: NextCertificationAction.CONTINUE,
      ...question,
    }
  })

}