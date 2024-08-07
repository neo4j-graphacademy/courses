import { generateLessonCacheKey, getFromCache } from "..";
import { ASCIIDOC_DIRECTORY, NEO4J_HOST, NEO4J_PASSWORD, NEO4J_USERNAME } from "../../../constants";
import { Course, STATUS_ACTIVE } from "../../../domain/model/course";
import initNeo4j, { close, read } from "../../neo4j";
import { cache, getLessons } from './cache-html'
import { readdirSync, existsSync } from "fs";
import { join } from "path";
import 'dotenv/config'

describe('caching', () => {
  beforeAll(async () => {
    await initNeo4j(NEO4J_HOST, NEO4J_USERNAME, NEO4J_PASSWORD)
  })

  afterAll(() => close())

  it('should replace attributes and save to cache', async () => {
    const course = {
      slug: 'llm-chatbot-typescript',
      usecase: 'recommendations',
      repository: 'neo4j-graphacademy/llm-chatbot-typescript'
    } as Course

    const module = '6-agent'
    const lesson = '4-create-agent'

    const key = await cache(course, module, lesson)

    const html = getFromCache(key)

    expect(html).not.toContain('Unresolved directive')
  })

  const coursesPath = join(ASCIIDOC_DIRECTORY, 'courses')

  const courses = readdirSync(coursesPath)
    .filter(file => !file.startsWith('.'))
    .filter(file => !['app-go-old'].includes(file))
    .filter(file => !file.startsWith('jp-'))
    .filter(file => !file.startsWith('cn-'))

  for (const course of courses) {
    describe(course, () => {
      const coursePath = join(coursesPath, course)
      const moduleDir = join(coursePath, 'modules')

      if (existsSync(moduleDir)) {
        const modules = readdirSync(moduleDir)
          .filter(file => !file.startsWith('.'))

        for (const module of modules) {
          describe(module, () => {
            const lessonsDir = join(moduleDir, module, 'lessons')

            const lessons = readdirSync(lessonsDir)
              .filter(file => existsSync(join(lessonsDir, file, 'lesson.adoc')))

            for (const lesson of lessons) {
              describe(lesson, () => {
                it('should build without errors', async () => {
                  const res = await read(`
                    MATCH (c:Course {slug: $course})
                    RETURN c { .* } AS course
                    `, { course })

                  const props = res.records[0].get('course')

                  const key = await cache(props, module, lesson)

                  const html = getFromCache(key)

                  expect(html).not.toContain('Unresolved directive')
                  expect(html).not.toContain('WARNING: lesson.adoc')
                })
              })
            }
          })
        }
      }
    })
  }
})
