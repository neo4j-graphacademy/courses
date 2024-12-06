import { config } from 'dotenv'
import { Driver, Session } from "neo4j-driver"
import checkExistingAttempts, { CertificationStatus, NextCertificationAction } from './check-existing-attempts'
import startCertification, { createAttempt } from './start-certification'
import { User } from '../../../domain/model/user'
import initNeo4j from '../../neo4j'
import saveAnswer from './save-answer'
import markAsCompleted from './mark-as-completed'
import { CompletionSource } from '../../../domain/events/UserCompletedCourse'

config()

describe('Certification Module', () => {
  const slug = 'neo4j-certification'
  let driver: Driver
  let session: Session
  let sub: string
  let user: User

  beforeAll(async () => {
    driver = await initNeo4j(
      process.env.NEO4J_HOST as string,
      process.env.NEO4J_USERNAME as string,
      process.env.NEO4J_PASSWORD as string,
    )

    session = driver.session()

    const res = await driver.executeQuery(`
      CREATE (u:User:CheckExistingAttemptsTest {sub: 'test|'+ randomUuid()})
      RETURN u.sub AS sub
    `)

    sub = res.records[0].get('sub')
    user = {
      sub,
      givenName: '[test]',
      name: '[test]',
      picture: '[test]',
      email: '[test]@neo4j.com',
    } as User
  })

  beforeEach(async () => {
    await driver.executeQuery(`
      MATCH (u:User {sub: $sub})
      FOREACH (n in [ (u)-[*1..2]->(n:Enrolment|CertificationAttempt) | n] |
        DETACH DELETE n
      )
    `, { sub })
  })

  afterAll(async () => {
    await driver.close()
  })

  describe('end-to-end', () => {
    it('should pass a certification with 100% correct answers', async () => {
      const res = await session.executeWrite(
        async tx => {
          const create = await createAttempt(tx, slug, user, undefined, undefined)
          const res = await tx.run<{ id: string, correct: string[] }>(`
            MATCH (c:CertificationAttempt {id: $attemptId})-[:ASSIGNED_QUESTION]->(q)
            RETURN q.id AS id, q.correct AS correct
          `, { attemptId: create.attemptId })

          const answers = res.records.map(row => row.toObject())

          return {
            ...create,
            answers,
          }
        }
      )

      // Answer all of the questions correctly
      let last: CertificationStatus | undefined
      while (res.answers.length) {
        const next = res.answers.pop()

        if (next) {
          last = await saveAnswer(slug, user, next.id, next.correct)
        }
      }

      // Next action should be to complete
      expect(last?.action).toBe(NextCertificationAction.COMPLETE)

      // Check results
      const status = await session.executeRead(
        tx => checkExistingAttempts(tx, slug, user)
      )

      expect(status.finished).toBe(true)
      expect(status.passed).toBe(true)
      expect(status.hasResults).toBe(true)
      expect(status.action).toBe(NextCertificationAction.COMPLETE)

      // Complete the enrolment
      const complete = await session.executeWrite(
        async tx => markAsCompleted(tx, res.attemptId, CompletionSource.WEBSITE)
      )

      expect(complete.completed).toBe(true)
      expect(complete.passed).toBe(true)
      expect(complete.percentage).toBe(100)
    })

    it('should pass certification after previously failing', async () => {
      const { action, attemptId } = await startCertification(slug, user, undefined, undefined)

      expect(action).toBe(NextCertificationAction.CREATE)
      expect(attemptId).toBeDefined()

      // First attempt - fail by answering everything incorrectly
      const firstAttempt = await session.executeWrite(async tx => {
        const res = await tx.run<{ id: string, correct: string[] }>(`
          MATCH (c:CertificationAttempt {id: $attemptId})-[:ASSIGNED_QUESTION]->(q)
          RETURN q.id AS id, q.correct AS correct
        `, { attemptId: attemptId })

        return {
          attemptId: attemptId as string,
          answers: res.records.map(row => row.toObject()),
        }
      })

      // Answer all questions incorrectly
      let last: CertificationStatus | undefined
      while (firstAttempt.answers.length) {
        const next = firstAttempt.answers.pop()
        if (next) {
          last = await saveAnswer(slug, user, next.id, firstAttempt.answers.length < 10 ? next.correct : [])
        }
      }

      expect(last?.action).toBe(NextCertificationAction.COMPLETE)

      // Complete the failed attempt
      const failedResult = await session.executeWrite(
        async tx => markAsCompleted(tx, firstAttempt.attemptId, CompletionSource.WEBSITE)
      )


      expect(failedResult.completed).toBe(false)
      expect(failedResult.passed).toBe(false)
      expect(failedResult.percentage).toBeLessThan(80)

      const { action: action2, } = await startCertification(slug, user, undefined, undefined)
      expect(action2).toBe(NextCertificationAction.ATTEMPTS_EXCEDED)


      // Set the attempt to 25 hours ago
      await session.executeWrite(async tx => {
        await tx.run(`
          MATCH (c:CertificationAttempt {id: $attemptId})
          SET c.createdAt = datetime() - duration('PT25H')
        `, { attemptId: firstAttempt.attemptId })
      })

      const { action: action3, attemptId: attemptId3 } = await startCertification(slug, user, undefined, undefined)

      expect(action3).toBe(NextCertificationAction.CREATE)

      // Second attempt - pass by answering everything correctly
      const secondAttempt = await session.executeWrite(async tx => {
        const res = await tx.run<{ id: string, correct: string[] }>(`
          MATCH (c:CertificationAttempt {id: $attemptId})-[:ASSIGNED_QUESTION]->(q)
          RETURN q.id AS id, q.correct AS correct
        `, { attemptId: attemptId3 })

        return {
          attemptId: attemptId3 as string,
          answers: res.records.map(row => row.toObject()),
        }
      })

      // Answer all questions correctly
      while (secondAttempt.answers.length) {
        const next = secondAttempt.answers.pop()
        if (next) {
          last = await saveAnswer(slug, user, next.id, next.correct)
        }
      }

      expect(last?.action).toBe(NextCertificationAction.COMPLETE)

      // Complete the successful attempt
      const passedResult = await session.executeWrite(
        async tx => markAsCompleted(tx, secondAttempt.attemptId, CompletionSource.WEBSITE)
      )

      expect(passedResult.completed).toBe(true)
      expect(passedResult.passed).toBe(true)
      expect(passedResult.percentage).toBe(100)
      expect(passedResult.enrolmentId).toBeDefined()

      // Check enrolment status
      const status = await session.executeRead(
        tx => tx.run(`
          MATCH (e:Enrolment {id: $enrolmentId})
          RETURN e.completedAt AS completedAt, e:CompletedEnrolment AS completed
        `, { enrolmentId: passedResult.enrolmentId })
      )

      expect(status.records[0].get('completed')).toBe(true)
    })
  })
})
