import { ManagedTransaction } from "neo4j-driver";
import { NextCertificationAction } from "./check-existing-attempts";

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

export default async function getNextQuestion(tx: ManagedTransaction, slug: string, attemptId: string): Promise<{ action: NextCertificationAction, question: CertificationQuestion | undefined }> {
  const res = await tx.run<{ question: CertificationQuestion }>(`
    MATCH (a:CertificationAttempt {id: $attemptId})-[:ASSIGNED_QUESTION]->(q)-[:IN_CATEGORY]->(c)
    WHERE not (a)-[:PROVIDED_ANSWER]->(q)
    RETURN q { .*,
        category: [ (q)-[:IN_CATEGORY]->(c) | c { .slug, .title } ][0]
    } AS question
    ORDER BY q.level ASC, c.order ASC LIMIT 1
  `, { slug, attemptId })

  const question = res.records[0]?.get('question')

  if (question === undefined) {
    return {
      action: NextCertificationAction.COMPLETE,
      question: undefined,
    }
  }

  return {
    action: NextCertificationAction.CONTINUE,
    question,
  }
}
