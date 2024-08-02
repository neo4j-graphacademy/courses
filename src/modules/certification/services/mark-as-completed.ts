import { ManagedTransaction } from "neo4j-driver";

type CompletedRecord = {
  completed: boolean;
  percentage: number;
  passed: boolean;
}

export default async function markAsCompleted(tx: ManagedTransaction, attemptId: string): Promise<CompletedRecord> {
  const res = await tx.run<CompletedRecord>(`
    MATCH (a:CertificationAttempt {id: $attemptId})<-[:HAS_ATTEMPT]-(e)-[:FOR_COURSE]->(c)
    WITH a, c, e,
      COUNT { (a)-[:PROVIDED_ANSWER {correct: true}]->() } AS correct,
      COUNT { (a)-[:ASSIGNED_QUESTION]->() } AS assigned
    WITH a, c, e, correct, assigned, 100.0 * correct / assigned AS score

    SET a.updatedAt = datetime(),
      e.updatedAt = datetime(),
      e.lastSeenAt = datetime(),
      e.completedAt = datetime(),
      e.percentage = score,
      e.attempts = COUNT { (e)-[:HAS_ATTEMPT]->() }

    FOREACH (_ IN CASE WHEN score >= c.passPercentage THEN [1] ELSE [] END |
      SET a:SuccessfulAttempt,
        e:CompletedEnrolment,
        e.certificateId = randomUuid()
      REMOVE a:FailedEnrolment
    )

    FOREACH (_ IN CASE WHEN score < c.passPercentage THEN [1] ELSE [] END |
      SET e:FailedEnrolment,
        a:UnsuccessfulAttempt
    )

    RETURN e:CompletedEnrolment AS completed,
      score AS percentage,
      score >= c.passPercentage AS passed
  `, { attemptId })

  return res.records[0].toObject()
}
