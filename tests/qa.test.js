const { join, sep } = require('path')
const { globSync } = require('glob')
const { readFileSync } = require('fs')
const { getAttribute, globJoin } = require('./utils')



describe('QA Tests', () => {
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
