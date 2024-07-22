import { User } from "../../../domain/model/user";
import NotFoundError from "../../../errors/not-found.error";
import { readTransaction } from "../../neo4j";
import checkExistingAttempts, { CertificationStatus, NextCertificationAction } from "./check-existing-attempts";
import getCertificationInformation, { AbridgedCertification } from "./get-certification-information";
import getNextQuestion, { CertificationQuestion } from "./get-next-question";
import { getPrerequisiteProgress, PrerequisiteProgress } from "./get-prerequisite-progress";

type CertificationResponse = {
  course: AbridgedCertification;

  // Has it been failed in the last 24 hours?
  failed: boolean;
  percentage: number | undefined;
  updatedAt: string; // DateTime

  // Expires At
  expiresAt: string; // DateTime

  // Has the user passed the certification?
  passed: boolean;

  // Is the quiz currently in progress?
  inProgress: boolean;

  // Is there a summary of results?
  summary: boolean;


  // Has the existing attempt been completed?
  timedOut: boolean;

  // Is quiz available
  available: boolean;

  // Timestamp for when next attempt will be available
  availableAfter: string | undefined;

  // Has the user completed the prerequisites?
  prerequisites: PrerequisiteProgress[]

  // Next question?
  question: CertificationQuestion | undefined;
}



export default async function getCertification(slug: string, user: User | undefined): Promise<CertificationResponse> {
  const res = await readTransaction<CertificationResponse>(async tx => {
    const course = await getCertificationInformation(tx, slug)

    let attempt: Partial<CertificationStatus> = {}
    let question: CertificationQuestion | undefined

    let inProgress = false


    if (user !== undefined) {
      attempt = await checkExistingAttempts(tx, slug, user)

      inProgress = attempt.action === NextCertificationAction.CONTINUE
      if (attempt.action === NextCertificationAction.CONTINUE && attempt.attemptId !== undefined) {
        const res = await getNextQuestion(tx, slug, attempt.attemptId)
        question = res.question
      }
    }
    const prerequisites = await getPrerequisiteProgress(tx, slug, user)

    return {
      course,
      inProgress,
      prerequisites,
      ...attempt,
      question,
    }
  })

  if (res === undefined) {
    throw new NotFoundError(`Could not find certification ${slug}`)
  }

  return res
}
