import { DateTime, ManagedTransaction, } from "neo4j-driver"
import { User } from "../../../domain/model/user"
import getCertificationInformation, { AbridgedCertification } from "./get-certification-information";
import { CertificationQuestion } from "./get-next-question";

export enum NextCertificationAction {
  CREATE = "create",
  CONTINUE = "continue",
  ATTEMPTS_EXCEDED = "exceded",
  COMPLETE = "complete",
  SUCCEEDED = "succeeded",
}

export type CertificationStatus = {
  course: AbridgedCertification;
  action: NextCertificationAction;
  passed: boolean;
  failed: boolean;
  inProgress: boolean;
  finished: boolean;
  expiresAt: string | undefined; // DateTime
  available: boolean;
  availableAfter: string | undefined; // DateTime
  hasResults: boolean;
  days: number | undefined;
  hours: number | undefined;
  minutes: number | undefined;

  enrolmentId: string | undefined;
  attemptId: string | undefined;
  certificateId: string | undefined;
  certificateLink: string | undefined;
  progress: number;
  percentage: number;
  currentPassPercentage: number;
  question?: CertificationQuestion;
}

export default async function checkExistingAttempts(tx: ManagedTransaction, slug: string, user: User): Promise<Partial<CertificationStatus>> {
  const course = await getCertificationInformation(tx, slug)

  const res = await tx.run<Omit<CertificationStatus, 'course' | 'action'> & {
    days: number;
    hours: number;
    minutes: number;
    expiresAt: DateTime
  }>(`
    MATCH (u:User {sub: $sub})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c:Course {slug: $slug})

    OPTIONAL MATCH  (e)-[:HAS_ATTEMPT]->(a)
    WITH c, e, a,
      duration.between(a.createdAt, datetime()) AS durationSinceLastAttempt,
      COUNT { (a)-[:ASSIGNED_QUESTION]->() } AS assigned,
      COUNT { (a)-[:PROVIDED_ANSWER]->() } AS answered,
      COUNT { (a)-[:PROVIDED_ANSWER {correct: true}]->() } AS correct
    ORDER BY a.createdAt DESC LIMIT 1

    RETURN
      // Existing Attempt
      e.id AS enrolmentId,
      a.id AS attemptId,

      // Has passed certification
      e:CompletedEnrolment OR (assigned > 0 AND 100.0 * correct / assigned >= coalesce(c.passPercentage, 80)) AS passed,
      answered > 0 AS hasSummary,
      e.certificateId AS certificateId,
      '/c/'+e.certificateId +'/' AS certificateUrl,

      // In Progress
      a.expiresAt >= datetime() AND answered < assigned AS inProgress,
      a.expiresAt AS expiresAt,
      a.expiresAt + duration('P1D') AS availableAfter,

      CASE WHEN assigned > 0 THEN 100.0 * correct / assigned ELSE null END AS percentage,
      CASE WHEN answered > 0 THEN 100.0 * correct / answered ELSE 0 END AS currentPassPercentage,
      CASE WHEN answered > 0 THEN 100.0 * answered / assigned ELSE 0 END AS progress,


      // Finished?
      a.expiresAt < datetime() OR answered = assigned AS finished,

      answered > 0 AS hasResults,
      durationSinceLastAttempt.minutesOfHour AS minutes,
      durationSinceLastAttempt.hours AS hours,
      durationSinceLastAttempt.days AS days,

      // Failed
      not e:CompletedEnrolment AS failed,
      a IS NULL OR a.expiresAt + duration('P1D') <= datetime() as available,

      assigned, answered, correct, toString(datetime()) AS now
  `, { sub: user.sub, slug })

  if (res.records.length > 0) {
    const output = res.records[0].toObject()

    let action = NextCertificationAction.CREATE

    // No previous action
    if (!output.attemptId) {
      action = NextCertificationAction.CREATE
    }
    // Hasn't expired, questions left
    else if (output.inProgress) {
      action = NextCertificationAction.CONTINUE
    }
    // More than a day
    else if (output.days > 0) {
      action = output.passed ? NextCertificationAction.SUCCEEDED : NextCertificationAction.CREATE
    }
    // Less than a day, more than an hour
    else if (output.days === 0 && output.hours > 0) {
      action = output.passed ? NextCertificationAction.COMPLETE : NextCertificationAction.ATTEMPTS_EXCEDED
    }
    // Less than a day, less than an hour
    else if (output.days === 0 && output.hours === 0) {
      if (output.finished === false) {
        action = NextCertificationAction.CONTINUE
      }
      else {
        action = output.passed ? NextCertificationAction.COMPLETE : NextCertificationAction.ATTEMPTS_EXCEDED
      }
    }

    return {
      course,
      ...output,
      expiresAt: output.expiresAt?.toString(),
      availableAfter: output.availableAfter?.toString(),
      action,
    }
  }

  // Create a new attempt
  return {
    available: true,
    failed: false,
    passed: false,
    inProgress: false,
    action: NextCertificationAction.CREATE,
  }
}
