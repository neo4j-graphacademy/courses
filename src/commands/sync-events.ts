/* eslint-disable @typescript-eslint/no-unused-vars */
import initNeo4j, { close, read } from "../modules/neo4j"

import {
  NEO4J_HOST,
  NEO4J_USERNAME,
  NEO4J_PASSWORD,
  SEGMENT_API_KEY,
} from '../constants'
import { initAnalytics } from "../modules/analytics/analytics.module"
import initAnalyticsListeners from "../modules/analytics/analytics.listeners"
import { UserEnrolled } from "../domain/events/UserEnrolled"
import { UserCompletedCourse } from "../domain/events/UserCompletedCourse"
import { UserCompletedLesson } from "../domain/events/UserCompletedLesson"
import { UserCompletedModule } from "../domain/events/UserCompletedModule"
import { User } from "../domain/model/user"
import { Course, CourseWithProgress } from "../domain/model/course"
import { emitter } from "../events"
import { Module } from "../domain/model/module"
import { LessonWithProgress } from "../domain/model/lesson"


async function getUserEnrolledEvents(start: string, end: string) {
  const res = await read<{
    user: User,
    course: CourseWithProgress,
    ref: string | undefined
  }>(`
    MATCH (u:User)-[:HAS_ENROLMENT]->(e:Enrolment)-[:FOR_COURSE]->(c:Course)
    WHERE datetime($start) <= e.createdAt <= datetime($end)
    RETURN u { .* }  AS user,
      c {
        .slug, .title, .sandbox,
        enrolmentId: e.id,
        categories: [ (c)-[:IN_CATEGORY]->(n) | n { .title, .slug }]
      } AS course,
      e.ref AS ref
  `, { start, end })

  console.log(`-- UserEnrolled: ${res.records.length}`);

  for (const row of res.records) {
    emitter.emit(
      new UserEnrolled(
        row.get('user'),
        row.get('course'),
        undefined,
        row.get('ref')
      )
    )
  }
}

async function getUserCompletedCourse(start: string, end: string) {
  const res = await read<{
    user: User,
    course: Course,
    module: Module,
    lesson: LessonWithProgress,
    ref: string | undefined
  }>(`
    MATCH (u:User)-[:HAS_ENROLMENT]->(e:CompletedEnrolment)-[:FOR_COURSE]->(c:Course)
    WHERE datetime($start) <= e.completedAt <= datetime($end)
    RETURN u { .* }  AS user,
      c {
        .slug, .title, .sandbox,
        enrolmentId: e.id,
        categories: [ (c)-[:IN_CATEGORY]->(n) | n { .title, .slug }]
      } AS course,
      e.ref AS ref
  `, { start, end })

  console.log(`-- UserCompletedCourse: ${res.records.length}`);

  for (const row of res.records) {
    emitter.emit(
      new UserCompletedCourse(
        row.get('user'),
        row.get('course'),
        undefined,
      )
    )
  }
}

async function getUserCompletedLesson(start: string, end: string) {
  const res = await read<{
    user: User,
    course: Course,
    module: Module,
    lesson: LessonWithProgress,
    ref: string | undefined
  }>(`
    MATCH (u:User)-[:HAS_ENROLMENT]->(e:Enrolment)-[:FOR_COURSE]->(c:Course),
      (e)-[r:COMPLETED_LESSON]->(l)<-[:HAS_LESSON]-(m)
    WHERE datetime($start) <= e.createdAt <= datetime($end)
      AND  datetime($start) <= r.createdAt <= datetime($end)
    RETURN u { .* }  AS user,
      c {
        .slug, .title, .sandbox,
        enrolmentId: e.id,
        categories: [ (c)-[:IN_CATEGORY]->(n) | n { .title, .slug }]
      } AS course,
      m { .* } AS module,
      l { .* } AS lesson,
      e.ref AS ref
  `, { start, end })

  console.log(`-- UserCompletedLesson: ${res.records.length}`);

  for (const row of res.records) {
    emitter.emit(
      new UserCompletedLesson(
        row.get('user'),
        row.get('course'),
        row.get('module'),
        row.get('lesson')
      )
    )
  }
}

async function getUserCompletedModule(start: string, end: string) {
  const res = await read<{
    user: User,
    course: Course,
    module: Module,
    lesson: LessonWithProgress,
    ref: string | undefined
  }>(`
    MATCH (u:User)-[:HAS_ENROLMENT]->(e:Enrolment)-[:FOR_COURSE]->(c:Course),
      (e)-[r:COMPLETED_MODULE]->(m)
    WHERE datetime($start) <= e.createdAt <= datetime($end)
      AND  datetime($start) <= r.createdAt <= datetime($end)
    RETURN u { .* }  AS user,
      c {
        .slug, .title, .sandbox,
        enrolmentId: e.id,
        categories: [ (c)-[:IN_CATEGORY]->(n) | n { .title, .slug }]
      } AS course,
      m { .* } AS module,
      e.ref AS ref
  `, { start, end })

  console.log(`-- UserCompletedModule: ${res.records.length}`);

  for (const row of res.records) {
    emitter.emit(
      new UserCompletedModule(
        row.get('user'),
        row.get('module')
      )
    )
  }
}


const main = async () => {
  await initNeo4j(NEO4J_HOST, NEO4J_USERNAME, NEO4J_PASSWORD)

  console.log(`Connected to ${NEO4J_HOST} as ${NEO4J_USERNAME}`);


  if (!SEGMENT_API_KEY) {
    throw new Error('SEGMENT_API_KEY not set')
  }

  initAnalytics()
  await initAnalyticsListeners()

  const start = '2024-06-30T15:14:48.573Z'
  const end = '2024-07-30T10:04:15.284Z'

  // Enrolments Created
  // await getUserEnrolledEvents(start, end)

  // Lessons completed
  await getUserCompletedLesson(start, end)

  // Modules completed
  await getUserCompletedModule(start, end)

  // Enrolments completed
  await getUserCompletedCourse(start, end)

  console.log('-- waiting');


  await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000))

  console.log('-- done');

  await close()
}

// eslint-disable-next-line
main()