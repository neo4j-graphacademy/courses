import initNeo4j, { read, writeTransaction } from "../modules/neo4j"

import {
  NEO4J_HOST,
  NEO4J_USERNAME,
  NEO4J_PASSWORD
} from '../constants'

import markAsCompleted from "../modules/certification/services/mark-as-completed"
import { emitter } from "../events"
import { initAnalytics } from "../modules/analytics/analytics.module"
import initEmailListeners from "../listeners/emails"
import { CompletionSource, UserCompletedCourse } from "../domain/events/UserCompletedCourse"
import { User } from "../domain/model/user"
import { CourseWithProgress } from "../domain/model/course"



const main = async () => {
  const driver = await initNeo4j(NEO4J_HOST, NEO4J_USERNAME, NEO4J_PASSWORD)

  initAnalytics()
  await initEmailListeners()

  const res = await read<{ user: User, course: CourseWithProgress, attemptId: string }>(`
    MATCH (u:User)-[:HAS_ENROLMENT]->(e)-[:HAS_ATTEMPT]->(a:CertificationAttempt),
        (e)-[:FOR_COURSE]->(c)
    WHERE a.createdAt <= datetime() - duration('PT1H') and not e:CompletedEnrolment and not e:FailedEnrolment
    RETURN a.id AS attemptId,
        u { .* } AS user,
        c { .title, .slug } AS course
  `)


  if (res.records.length > 0) {
    await writeTransaction(async tx => {
      for (const record of res.records) {
        const output = await markAsCompleted(tx, record.get('attemptId'), CompletionSource.CRON)

        if (output.passed) {
          emitter.emit(
            new UserCompletedCourse(
              record.get('user'),
              record.get('course'),
              output.source
            )
          )
        }
      }
    })
  }

  console.log(`\n😩 ${res.records.length || 0} certifications marked as completed`)

  await driver.close()
}

// eslint-disable-next-line
main()
