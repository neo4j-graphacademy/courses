import { config } from 'dotenv'
import { Driver, driver as connect, auth, Session, int } from "neo4j-driver"
import checkExistingAttempts, { NextCertificationAction } from './check-existing-attempts'
import { createAttempt } from './start-certification'
import { User } from '../../../domain/model/user'
import { createDriver } from '../../neo4j'

config()

describe('checkExistingAttempts', () => {
  const slug = 'neo4j-certification'
  let driver: Driver
  let session: Session
  let sub: string
  let user: User

  beforeAll(async () => {
    driver = await createDriver(
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
    // await driver.executeQuery(`
    //   MATCH (u:User {sub: $sub})
    //   FOREACH (n in [ (u)-[*1..2]->(n:Enrolment|CertificationAttempt) | n] |
    //     DETACH DELETE n
    //   )
    //   DETACH DELETE u
    // `, { sub })

    await driver.close()
  })

  describe('pre-test', () => {
    it('should be available if no previous attempts have been made', async () => {
      expect(sub).toBeDefined()

      const res = await session.executeRead(
        tx => checkExistingAttempts(tx, slug, { sub } as User)
      )
      expect(res.available).toBe(true)
      expect(res.action).toBe(NextCertificationAction.CREATE)
    })

    it('should let a user re-take if they have passed an older certification', async () => {
      await session.executeWrite(
        async tx => await tx.run(`
          MATCH (u:User {sub: $sub})
          MATCH (c:Course {slug: $slug})
          CREATE (e:Enrolment:CompletedEnrolment {
            id: randomUuid(),
            createdAt: datetime() - duration('P4M')
          })

          CREATE (u)-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c)
          RETURN e.id AS id
        `, { sub, slug })
      )

      const res = await session.executeWrite(
        tx => checkExistingAttempts(tx, slug, user)
      )

      expect(res.attemptId).toBe(null)
      expect(res.available).toBe(true)
      expect(res.passed).toBe(true)
      expect(res.failed).toBe(false)
      expect(res.action).toBe(NextCertificationAction.CREATE)
    })
  })

  describe('in progress - within test time limit (1hr)', () => {
    it('should allow user to continue current exam if visited within an hour', async () => {
      const { create, status, } = await session.executeWrite(
        async tx => {
          const create = await createAttempt(tx, slug, user, undefined, undefined)
          const status = await checkExistingAttempts(tx, slug, user)

          return {
            create,
            status,
          }
        }
      )

      expect(create.enrolmentId).toBe(status.enrolmentId)
      expect(create.attemptId).toBe(status.attemptId)
      expect(status.inProgress).toBe(true)
      expect(status.action).toBe(NextCertificationAction.CONTINUE)
    })
  })

  describe('completed within time limit', () => {
    it('should show passed if correct score is greater than pass percentage', async () => {
      const { count, create, status, } = await session.executeWrite(
        async tx => {
          const create = await createAttempt(tx, slug, user, undefined, undefined)

          // Answer all questions as correct
          const res = await tx.run(`
              MATCH (a:CertificationAttempt {id: $id})-[:ASSIGNED_QUESTION]->(q),
                (a)<-[:HAS_ATTEMPT]-(e)
              MERGE (a)-[r:PROVIDED_ANSWER]->(q)
              SET r.correct = true, r.answers = q.correct,
                e:CompletedEnrolment
              RETURN count(*) AS count
            `, { id: create.attemptId })

          const count = res.records[0].get('count')

          const status = await checkExistingAttempts(tx, slug, user)

          return {
            count,
            create,
            status,
          }
        }
      )

      expect(count).toBe(create.questions)
      expect(create.enrolmentId).toBe(status.enrolmentId)
      expect(create.attemptId).toBe(status.attemptId)
      expect(status.inProgress).toBe(false)
      expect(status.finished).toBe(true)
      expect(status.hasResults).toBe(true)
      expect(status.passed).toBe(true)
      expect(status.action).toBe(NextCertificationAction.COMPLETE)
    })

    it('should show failed if correct score is less than pass percentage ', async () => {
      const { percentage, create, status, } = await session.executeWrite(
        async tx => {
          const create = await createAttempt(tx, slug, user, undefined, undefined)

          const correct = 10

          // Answer all questions as correct
          const res = await tx.run(`
              MATCH (a:CertificationAttempt {id: $id})-[:ASSIGNED_QUESTION]->(q),
                (a)<-[:HAS_ATTEMPT]-(e)
              MERGE (a)-[r:PROVIDED_ANSWER]->(q)
              SET r.correct = false

              WITH a, collect(r) AS rs
              UNWIND range(0, $correct) AS idx
              WITH rs[idx] AS r
              SET r.correct = true

              RETURN count(*) AS count
            `, { id: create.attemptId, correct: int(correct) })

          const count = res.records[0].get('count')

          const status = await checkExistingAttempts(tx, slug, user)

          return {
            count,
            percentage: 100 * count / create.questions,
            create,
            status,
          }
        }
      )

      expect(create.enrolmentId).toBe(status.enrolmentId)
      expect(create.attemptId).toBe(status.attemptId)
      expect(status.inProgress).toBe(false)
      expect(status.finished).toBe(true)
      expect(status.hasResults).toBe(true)
      expect(status.passed).toBe(false)
      expect(status.percentage).toBe(percentage)
      expect(status.currentPassPercentage).toBe(percentage)
      expect(status.action).toBe(NextCertificationAction.ATTEMPTS_EXCEDED)
    })
  })

  describe('within 24 hours of last attempt', () => {
    it('should show passed if correct percentage >= pass percentage', async () => {
      const { count, create, status, } = await session.executeWrite(
        async tx => {
          const create = await createAttempt(tx, slug, user, undefined, undefined)

          // Answer all questions as correct
          const res = await tx.run(`
            MATCH (a:CertificationAttempt {id: $id})
            SET a.createdAt = datetime() - duration('PT6H'),
              a.expiresAt = datetime() - duration('PT5H')

            WITH a
            MATCH (a)-[:ASSIGNED_QUESTION]->(q)
            MERGE (a)-[r:PROVIDED_ANSWER]->(q)
            SET r.correct = true, r.answers = q.correct
            RETURN count(*) AS count
          `, { id: create.attemptId })

          const count = res.records[0].get('count')

          const status = await checkExistingAttempts(tx, slug, user)
          return {
            count,
            create,
            status,
          }
        }
      )

      expect(count).toBe(create.questions)
      expect(create.enrolmentId).toBe(status.enrolmentId)
      expect(create.attemptId).toBe(status.attemptId)
      expect(status.available).toBe(false)
      expect(status.inProgress).toBe(false)
      expect(status.finished).toBe(true)
      expect(status.hasResults).toBe(true)
      expect(status.passed).toBe(true)
      expect(status.action).toBe(NextCertificationAction.COMPLETE)
    })


    it('should show failed if correct percentage < pass percentage', async () => {
      const { percentage, create, status, } = await session.executeWrite(
        async tx => {
          const create = await createAttempt(tx, slug, user, undefined, undefined)

          const correct = 10

          // Answer all questions as correct
          const res = await tx.run(`
            MATCH (a:CertificationAttempt {id: $id})
            SET a.createdAt = datetime() - duration('PT6H'),
              a.expiresAt = datetime() - duration('PT5H')
            WITH a

            MATCH (a)-[:ASSIGNED_QUESTION]->(q),
              (a)<-[:HAS_ATTEMPT]-(e)
            MERGE (a)-[r:PROVIDED_ANSWER]->(q)
            SET r.correct = false

            WITH a, collect(r) AS rs
            UNWIND range(0, $correct) AS idx
            WITH rs[idx] AS r
            SET r.correct = true

            RETURN count(*) AS count
        `, { id: create.attemptId, correct: int(correct) })

          const count = res.records[0].get('count')

          const status = await checkExistingAttempts(tx, slug, user)

          return {
            count,
            percentage: 100 * count / create.questions,
            create,
            status,
          }
        }
      )

      expect(create.enrolmentId).toBe(status.enrolmentId)
      expect(create.attemptId).toBe(status.attemptId)
      expect(status.available).toBe(false)
      expect(status.inProgress).toBe(false)
      expect(status.finished).toBe(true)
      expect(status.hasResults).toBe(true)
      expect(status.passed).toBe(false)
      expect(status.percentage).toBe(percentage)
      expect(status.currentPassPercentage).toBe(percentage)
      expect(status.action).toBe(NextCertificationAction.ATTEMPTS_EXCEDED)
    })
  })

  it('should not allow re-take within 24 hours', async () => {
    const { status, } = await session.executeWrite(
      async tx => {
        const create = await createAttempt(tx, slug, user, undefined, undefined)

        const correct = 10

        // Answer all questions as correct
        const res = await tx.run(`
          MATCH (a:CertificationAttempt {id: $id})
          SET a.createdAt = datetime() - duration('PT6H'),
            a.expiresAt = datetime() - duration('PT5H')
          WITH a

          MATCH (a)-[:ASSIGNED_QUESTION]->(q),
            (a)<-[:HAS_ATTEMPT]-(e)
          MERGE (a)-[r:PROVIDED_ANSWER]->(q)
          SET r.correct = false

          WITH a, collect(r) AS rs
          UNWIND range(0, $correct) AS idx
          WITH rs[idx] AS r
          SET r.correct = true

          RETURN count(*) AS count
      `, { id: create.attemptId, correct: int(correct) })

        const count = res.records[0].get('count')

        const status = await checkExistingAttempts(tx, slug, user)

        return {
          count,
          percentage: 100 * count / create.questions,
          create,
          status,
        }
      }
    )

    expect(status.action).toBe(NextCertificationAction.ATTEMPTS_EXCEDED)
  })



  describe('more than 24 hours since last attempt', () => {
    it('should show passed if correct percentage >= pass percentage', async () => {
      const { count, create, status, } = await session.executeWrite(
        async tx => {
          const create = await createAttempt(tx, slug, user, undefined, undefined)

          // Answer all questions as correct
          const res = await tx.run(`
              MATCH (a:CertificationAttempt {id: $id})
              SET a.createdAt = datetime() - duration('P2DT6H'),
                a.expiresAt = datetime() - duration('P2DT5H')

              WITH a
              MATCH (a)-[:ASSIGNED_QUESTION]->(q)
              MERGE (a)-[r:PROVIDED_ANSWER]->(q)
              SET r.correct = true, r.answers = q.correct
              RETURN count(*) AS count
            `, { id: create.attemptId })

          const count = res.records[0].get('count')

          const status = await checkExistingAttempts(tx, slug, user)
          return {
            count,
            create,
            status,
          }
        }
      )

      expect(count).toBe(create.questions)
      expect(create.enrolmentId).toBe(status.enrolmentId)
      expect(create.attemptId).toBe(status.attemptId)
      expect(status.available).toBe(true)
      expect(status.inProgress).toBe(false)
      expect(status.finished).toBe(true)
      expect(status.hasResults).toBe(true)
      expect(status.passed).toBe(true)
      expect(status.action).toBe(NextCertificationAction.SUCCEEDED)

    })


    it('should show failed if correct percentage < pass percentage', async () => {
      const { percentage, create, status, } = await session.executeWrite(
        async tx => {
          const create = await createAttempt(tx, slug, user, undefined, undefined)

          const correct = 10

          // Answer all questions as correct
          const res = await tx.run(`
            MATCH (a:CertificationAttempt {id: $id})
            SET a.createdAt = datetime() - duration('P2DT6H'),
              a.expiresAt = datetime() - duration('P2DT5H')
            WITH a

            MATCH (a)-[:ASSIGNED_QUESTION]->(q),
              (a)<-[:HAS_ATTEMPT]-(e)
            MERGE (a)-[r:PROVIDED_ANSWER]->(q)
            SET r.correct = false

            WITH a, collect(r) AS rs
            UNWIND range(0, $correct) AS idx
            WITH rs[idx] AS r
            SET r.correct = true

            RETURN count(*) AS count
        `, { id: create.attemptId, correct: int(correct) })

          const count = res.records[0].get('count')

          const status = await checkExistingAttempts(tx, slug, user)

          return {
            count,
            percentage: 100 * count / create.questions,
            create,
            status,
          }
        }
      )

      expect(status.available).toBe(true)
      expect(status.passed).toBe(false)
      expect(status.failed).toBe(true)
      expect(status.action).toBe(NextCertificationAction.CREATE)
    })


    it('should allow re-take after 24 hours', async () => {
      const { percentage, create, status, } = await session.executeWrite(
        async tx => {
          const create = await createAttempt(tx, slug, user, undefined, undefined)

          const correct = 10

          // Answer all questions as correct
          const res = await tx.run(`
              MATCH (a:CertificationAttempt {id: $id})
              SET a.createdAt = datetime() - duration('P2DT6H'),
                a.expiresAt = datetime() - duration('P2DT5H')
              WITH a

              MATCH (a)-[:ASSIGNED_QUESTION]->(q),
                (a)<-[:HAS_ATTEMPT]-(e)
              MERGE (a)-[r:PROVIDED_ANSWER]->(q)
              SET r.correct = false

              WITH a, collect(r) AS rs
              UNWIND range(0, $correct) AS idx
              WITH rs[idx] AS r
              SET r.correct = true

              RETURN count(*) AS count
          `, { id: create.attemptId, correct: int(correct) })

          const count = res.records[0].get('count')

          const status = await checkExistingAttempts(tx, slug, user)

          return {
            count,
            percentage: 100 * count / create.questions,
            create,
            status,
          }
        }
      )

      expect(status.action).toBe(NextCertificationAction.CREATE)
    })
  })
})
