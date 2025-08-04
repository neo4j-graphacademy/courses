import { User } from '../../../domain/model/user'
import { readTransaction } from '../../neo4j'
import checkExistingAttempts, { CertificationStatus } from './check-existing-attempts'
import getNextQuestion from './get-next-question'

export default function getCertificationStatus(slug: string, user: User): Promise<CertificationStatus> {
    return readTransaction(async (tx) => {
        const status = await checkExistingAttempts(tx, slug, user)

        if (!status.attemptId || status.finished) {
            return status
        }

        const { question } = await getNextQuestion(tx, slug, status.attemptId)

        return {
            ...status,
            question,
        }
    })
}
