import initNeo4j, { write, writeTransaction } from "../modules/neo4j"

import {
  NEO4J_HOST,
  NEO4J_USERNAME,
  NEO4J_PASSWORD
} from '../constants'

import { emitter } from "../events"
import { initAnalytics } from "../modules/analytics/analytics.module"
import { UserLogin } from "../domain/events/UserLogin"
import { JwtPayload } from "jsonwebtoken"
import { Request } from "express"
import initAnalyticsListeners from "../modules/analytics/analytics.listeners"

const main = async () => {
  const driver = await initNeo4j(NEO4J_HOST, NEO4J_USERNAME, NEO4J_PASSWORD)

  initAnalytics()
  await initAnalyticsListeners()

  const res = await write<{ user: JwtPayload, lastSeenAt: string }>(`
    MATCH (u:User)-[:HAS_ENROLMENT]->(e:Enrolment)
    WHERE datetime('2024-06-15') <= e.lastSeenAt <= datetime('2024-07-30')
    RETURN u { .* } AS user,
      max(e.lastSeenAt) AS lastSeenAt
  `)

  for (const record of res.records) {
    emitter.emit(
      new UserLogin(
        record.get('user'),
        {} as Request
      )
    )
  }

  console.log(`\n💨 ${res.records.length || 0} logins sent`)

  await driver.close()
}

// eslint-disable-next-line
main()
