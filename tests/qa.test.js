const { config } = require('dotenv')
const { join, sep, resolve } = require('path')
const { globSync } = require('glob')
const { readFileSync, existsSync } = require('fs')
const { getAttribute, globJoin, getStatusCode, findLinks, findCypherStatements } = require('./utils')
const { explainCypherError, initDriver, closeDriver } = require('./cypher')

describe('QA Tests', () => {
    beforeAll(() => {
        config({ path: resolve(__dirname, '..', '.env') })
        initDriver()
    })

    afterAll(() => closeDriver())

    const exclude = ['30-days']
    const coursePaths = globSync(globJoin(__dirname, '..', 'asciidoc', 'courses', '*'))
        .filter(path => exclude.some(folder => !path.endsWith(folder)))

    for (const coursePath of coursePaths) {
        const slug = coursePath.split(sep).reverse()[0]

        const courseAdoc = readFileSync(join(coursePath, 'course.adoc')).toString()
        const status = getAttribute(courseAdoc, 'status')
        const certification = getAttribute(courseAdoc, 'certification')

        if (status === 'active' && certification !== 'true') {
            describe(slug, () => {
                const modulePaths = globSync(globJoin(__dirname, '..', 'asciidoc',
                    'courses', slug, 'modules', '*'))

                it('should have a caption', () => {
                    expect(getAttribute(courseAdoc, 'caption')).toBeDefined()
                })

                it('should have one or more modules', () => {
                    expect(modulePaths.length).toBeGreaterThan(0)
                })

                it('should have an illustration', () => {
                    const illustrationPath = join(__dirname, '..', 'asciidoc',
                        'courses', slug, 'illustration.adoc')
                    const exists = existsSync(illustrationPath)

                    expect(exists).toBe(true)
                })

                for (modulePath of modulePaths) {
                    const moduleSlug = modulePath.split(sep).reverse()[0]
                    const lessonPaths = globSync(globJoin(__dirname, '..', 'asciidoc',
                        'courses', slug, 'modules', moduleSlug, 'lessons', '*'))

                    describe(moduleSlug, () => {
                        it('should have one or more lessons', () => {
                            expect(lessonPaths.length).toBeGreaterThan(0)
                        })

                        for (const lessonPath of lessonPaths) {
                            const lessonSlug = lessonPath.split(sep).reverse()[0]

                            const lessonAdoc = readFileSync(join(lessonPath, 'lesson.adoc')).toString()

                            const optional = getAttribute(lessonAdoc, 'optional') === 'true'
                            const hasReadButton = lessonAdoc.match(/read::(.*)\[\]/) !== null
                            const includesSandbox = lessonAdoc.includes('include::{shared}/courses/apps/sandbox.adoc[tags="summary')

                            describe(lessonSlug, () => {
                                const questionPaths = globSync(globJoin(__dirname, '..', 'asciidoc',
                                    'courses', slug, 'modules', moduleSlug, 'lessons',
                                    lessonSlug, 'questions', '*.adoc'))

                                it('should be optional, mark as read or have one or more questions', () => {
                                    expect(optional || hasReadButton || includesSandbox || questionPaths.length > 0).toBe(true)
                                })

                                // TODO: Test all verify & solution cypher files
                                // if (type === 'challenge' && !optional) {
                                //     it('should contain a valid verify.cypher', async () => {
                                //         expect(existsSync(join(__dirname, '..', 'asciidoc',
                                //             'courses', slug, 'modules', moduleSlug, 'lessons',
                                //             lessonSlug, 'verify.cypher'))
                                //         ).toBe(true)


                                //         const cypher = readFileSync(join(lessonPath, 'verify.cypher')).toString()
                                //         expect(await explainCypherError(cypher)).toBeUndefined()
                                //     })

                                //     it('should contain a valid solution.cypher', async () => {
                                //         expect(existsSync(join(__dirname, '..', 'asciidoc',
                                //             'courses', slug, 'modules', moduleSlug, 'lessons',
                                //             lessonSlug, 'solution.cypher'))
                                //         ).toBe(true)
                                //     })
                                // }

                                it('should not have any broken links', async () => {
                                    for (const link of findLinks(lessonAdoc)) {
                                        const statusCode = await getStatusCode(link)
                                        try {
                                            expect(statusCode).toBe(200)
                                        }
                                        catch (e) {
                                            throw new Error(`${link} returns ${statusCode}`)
                                        }
                                    }
                                })

                                it('should contain valid [source,cypher] blocks', async () => {
                                    for (const cypher of findCypherStatements(lessonAdoc)) {
                                        expect(await explainCypherError(cypher)).toBeUndefined()
                                    }
                                })

                                if (!optional && !hasReadButton) {
                                    for (const questionPath of questionPaths) {
                                        const questionFile = questionPath.split(sep).reverse()[0]
                                        const asciidoc = readFileSync(questionPath).toString()

                                        it(`${questionFile} should have a hint`, () => {
                                            expect(asciidoc).toContain('\n[TIP,role=hint]')
                                        })

                                        it(`${questionFile} should have a solution`, () => {
                                            expect(asciidoc).toContain('\n[TIP,role=solution]')
                                        })

                                        if (asciidoc.includes('verify::')) {
                                            it('requires verification, should have a valid verify.cypher', async () => {
                                                expect(existsSync(join(__dirname, '..', 'asciidoc',
                                                    'courses', slug, 'modules', moduleSlug, 'lessons',
                                                    lessonSlug, 'verify.cypher'))
                                                ).toBe(true)

                                                const contents = readFileSync(join(lessonPath, 'verify.cypher')).toString()

                                                for (const cypher of contents.split(';').filter(e => e.trim() != '')) {
                                                    expect(await explainCypherError(cypher)).toBeUndefined()
                                                }
                                            })

                                            it('requires verification, should have a valid solution.cypher', async () => {
                                                expect(existsSync(join(__dirname, '..', 'asciidoc',
                                                    'courses', slug, 'modules', moduleSlug, 'lessons',
                                                    lessonSlug, 'solution.cypher'))
                                                ).toBe(true)

                                                const contents = readFileSync(join(lessonPath, 'solution.cypher')).toString()

                                                for (const cypher of contents.split(';').filter(e => e.trim() != '')) {
                                                    expect(await explainCypherError(cypher)).toBeUndefined()
                                                }
                                            })
                                        }
                                    }
                                }
                            })
                        }
                    })
                }
            })
        }
    }
})
