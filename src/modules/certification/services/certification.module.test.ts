import { config } from 'dotenv'
import { Driver, driver as connect, auth, Session, int } from "neo4j-driver"
import checkExistingAttempts, { CertificationStatus, NextCertificationAction } from './check-existing-attempts'
import { createAttempt } from './start-certification'
import { User } from '../../../domain/model/user'
import initNeo4j, { createDriver } from '../../neo4j'
import saveAnswer from './save-answer'
import markAsCompleted from './mark-as-completed'

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

  afterAll(async () => {
    await driver.executeQuery(`
      MATCH (u:User {sub: $sub})
      FOREACH (n in [ (u)-[*1..2]->(n:Enrolment|CertificationAttempt) | n] |
        DETACH DELETE n
      )
      DETACH DELETE u
    `, { sub })

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
        async tx => markAsCompleted(tx, res.attemptId)
      )

      expect(complete.completed).toBe(true)
      expect(complete.passed).toBe(true)
      expect(complete.percentage).toBe(100)
    })
  })
})
