const { sep, parse } = require('path')
const { globSync } = require('glob')
const { globJoin, getActiveCoursePaths } = require('./utils')
const { config } = require('dotenv')
const neo4j = require('neo4j-driver')

config({ path: process.env.ENV_FILE || '.env.production' })

describe('Database Tests', () => {
    let driver
    let dbCourses

    beforeAll(async () => {

        driver = neo4j.driver(
            process.env.NEO4J_HOST,
            neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
        )

        const session = driver.session()
        const res = await session.run(
            `
                MATCH (c:Course {status: $status})
                WHERE not c:Certification
                RETURN c {
                    .slug,
                    modules: [ (c)-[:HAS_MODULE]->(m)  WHERE not m:DeletedModule | m {
                        .slug,
                        lessons: [ (m)-[:HAS_LESSON]->(l) WHERE not l:DeletedLesson | l {
                            .slug,
                            questions: [ (l)-[:HAS_QUESTION]->(q) WHERE not q:DeletedQuestion | q {
                                .id,
                                .text,
                                .filename
                            } ]
                        }]
                    } ]
                } AS course
            `,
            { status: 'active' }
        )
        await session.close()

        dbCourses = res.records.map(row => row.get('course'))
    })

    afterAll(() => driver.close())

    describe('sanity tests', () => {
        it('should have neo4j variables defined', () => {
            expect(process.env.NEO4J_HOST).toBeDefined()
            expect(process.env.NEO4J_USERNAME).toBeDefined()
            expect(process.env.NEO4J_PASSWORD).toBeDefined()
        })

        it('should verify connectivity', async () => {
            expect(await driver.verifyConnectivity()).toBeDefined()
        })

        it('should have correct number of active courses', async () => {
            expect(getActiveCoursePaths().length).toEqual(dbCourses.length)
        })
    })

    describe(process.env.NEO4J_HOST, () => {
        for (const coursePath of getActiveCoursePaths()) {
            const courseSlug = coursePath.split(sep).reverse()[0]

            describe(courseSlug, () => {
                const modulePaths = globSync(
                    globJoin(__dirname, '..', 'asciidoc', 'courses', courseSlug, 'modules', '*')
                )

                it('should have the correct number of modules', () => {
                    const dbCourse = dbCourses.find(course => course.slug === courseSlug)

                    const pathSlugs = modulePaths.map(path => path.split(sep).reverse()[0])
                    const dbSlugs = dbCourse.modules.map(modules => modules.slug)

                    expect(pathSlugs).toEqual(expect.arrayContaining(dbSlugs))
                })

                for (const modulePath of modulePaths) {
                    const moduleSlug = modulePath.split(sep).reverse()[0]
                    const lessonPaths = globSync(globJoin(__dirname, '..', 'asciidoc',
                        'courses', courseSlug, 'modules', moduleSlug, 'lessons', '*'))

                    describe(moduleSlug, () => {
                        it('module should exist in database', () => {
                            const dbCourse = dbCourses.find(course => course.slug === courseSlug)

                            expect(dbCourse).toBeDefined()

                            const dbModule = dbCourse.modules.find(module => module.slug == moduleSlug)
                            expect(dbModule).toBeDefined()
                        })

                        it('should have the correct number of lessons', () => {
                            const dbCourse = dbCourses.find(course => course.slug === courseSlug)
                            const dbModule = dbCourse.modules.find(module => module.slug == moduleSlug)

                            const pathSlugs = lessonPaths.map(path => path.split(sep).reverse()[0])
                            const dbSlugs = dbModule.lessons.map(lesson => lesson.slug)

                            expect(pathSlugs).toEqual(expect.arrayContaining(dbSlugs))
                        })

                        for (const lessonPath of lessonPaths) {
                            const lessonSlug = lessonPath.split(sep).reverse()[0]

                            const questionPaths = globSync(
                                globJoin(__dirname, '..', 'asciidoc',
                                    'courses', courseSlug, 'modules', moduleSlug, 'lessons',
                                    lessonSlug, 'questions', '*.adoc'
                                )
                            )

                            describe(lessonSlug, () => {
                                it('should exist in db and have the correct number of questions', () => {
                                    const dbCourse = dbCourses.find(course => course.slug === courseSlug)
                                    expect(dbCourse).toBeDefined()

                                    const dbModule = dbCourse.modules.find(module => module.slug == moduleSlug)
                                    expect(dbModule).toBeDefined()

                                    const dbLesson = dbModule.lessons.find(lesson => lesson.slug == lessonSlug)
                                    expect(dbLesson).toBeDefined()

                                    const pathQuestions = questionPaths.map(path => parse(path).base)
                                    const dbQuestions = dbLesson.questions.map(question => question.filename)

                                    expect(pathQuestions).toEqual(expect.arrayContaining(dbQuestions))
                                })
                            })
                        }
                    })
                }
            })
        }
    })
})