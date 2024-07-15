import { ManagedTransaction, } from "neo4j-driver"
import { User } from "../../../domain/model/user"
import { Course } from "../../../domain/model/course";

export enum NextCertificationAction {
  CREATE,
  CONTINUE,
  ATTEMPTS_EXCEDED,
  COMPLETE,
  SUCCEEDED,
}
type Category = {
  title: string;
  slug: string;
}

export type CertificationQuestion = {
  id: string;
  title: string;
  question: string;
  category: Category;
  level: number;
  options: string[];
  correct: string[];

  correctFeedback: string | null | undefined;
  incorrectFeedback: string | null | undefined;
}

export type CertificationStatus = {
  course: Partial<Course>,
  action: NextCertificationAction;
  id: string;
  certificateId: string | undefined;
  certificateUrl: string | undefined;
  completed: boolean;
  finished: boolean;
  percentage: number; // Percentage of total questions that are correct
  failed: boolean;
  updatedAt: string; //DateTime;
  createdAt: string; //DateTime;
  expiresAt: string; //DateTime;
  availableAfter: string; //DateTime;
  minutes: number;
  hours: number;
  days: number;
  assigned: number;
  answered: number;
  progress: number;
  score: number; // Percentage of CURRENT questions that are correct
  question: CertificationQuestion | undefined;
}


export default async function checkExistingAttempts(tx: ManagedTransaction, slug: string, user: User): Promise<Partial<CertificationStatus>> {
  const res = await tx.run<Omit<CertificationStatus, 'action'>>(`
    MATCH (u:User {sub: $sub})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c:Course {slug: $slug}),
      (e)-[:HAS_ATTEMPT]->(a)
    WITH c, e, a,
      duration.between(a.createdAt, datetime()) AS durationSinceLastAttempt,
      COUNT { (a)-[:ASSIGNED_QUESTION]->() } AS assigned,
      COUNT { (a)-[:PROVIDED_ANSWER]->() } AS answered,
      COUNT { (a)-[:PROVIDED_ANSWER {correct: true}]->() } AS correct
    ORDER BY a.createdAt DESC LIMIT 1

    // Get the next question
    CALL {
      WITH a
      OPTIONAL MATCH (a)-[:ASSIGNED_QUESTION]->(q)-[:IN_CATEGORY]->(c)
      WHERE not (a)-[:PROVIDED_ANSWER]->(q)
      RETURN q
      ORDER BY q.level ASC, c.order ASC LIMIT 1
    }

    RETURN a.id AS id,
      e:CompletedEnrolment AS completed,
      NOT e:CompletedEnrolment AS failed,
      round(100.0 * correct / assigned, 1) AS percentage,
      e.certificateId AS certificateId,
      '/c/'+e.certificateId +'/' AS certificateUrl,
      toString(a.updatedAt) AS updatedAt,
      toString(a.createdAt) AS createdAt,
      toString(a.expiresAt) AS expiresAt,
      a.expiresAt + duration('P1D') <= datetime() AS available,
      toString(a.expiresAt + duration('P1D')) AS availableAfter,
      durationSinceLastAttempt.minutesOfHour AS minutes,
      durationSinceLastAttempt.hours AS hours,
      durationSinceLastAttempt.days AS days,
      assigned,
      answered,
      100.0 * answered / assigned AS progress,
      answered = assigned AS finished,
      CASE WHEN answered > 0 THEN 100.0 * correct / answered ELSE 0 END AS score,
      c { .title, .slug, .link, .caption } AS course,
      q { .*,
        category: [ (q)-[:IN_CATEGORY]->(c) | c { .slug, .title } ][0]
      } AS question
  `, { sub: user.sub, slug })

  let action: NextCertificationAction = NextCertificationAction.CREATE

  if (res.records.length) {
    const output = res.records[0].toObject()

    // Has user already completed it?
    if (output.completed || output.assigned === output.answered) {
      action = NextCertificationAction.SUCCEEDED
    }
    // Within an hour, continue the current attempt
    else if (output.days == 0 && output.hours == 0) {
      action = NextCertificationAction.CONTINUE
    }
    // More than an hour, less than a day
    else if (output.days == 0 && output.hours > 0) {
      action = NextCertificationAction.ATTEMPTS_EXCEDED
    }

    return {
      ...output,
      action,
    }
  }

  // Create a new attempt
  return {
    action: NextCertificationAction.CREATE,
  }
}
