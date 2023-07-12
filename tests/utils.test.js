const { globSync } = require('glob')
const { getAttribute, globJoin } = require('./utils')
const { existsSync } = require('fs')

describe('Utils', () => {
    describe('getAttribute', () => {
        it('should match an attribute', () => {
            const asciidoc = `\n\n:foo: bar\nbaz: foo\n`
            const attribute = 'foo'

            const actual = getAttribute(asciidoc, attribute)
            const expected = 'bar'

            expect(actual).toBe(expected)
        })

        it('should return undefined if attribute not found', () => {
            const asciidoc = `\n\n:foo: bar\nbaz: foo\n`
            const attribute = 'bar'

            const actual = getAttribute(asciidoc, attribute)
            const expected = undefined

            expect(actual).toBe(expected)
        })
    })

    describe('globJoin', () => {
        const coursePaths = globSync(globJoin(__dirname, '..', 'asciidoc', 'courses', '*'))

        it('should have files', () => {
            expect(coursePaths.length).toBeGreaterThan(0)
        })

        it('should locate the course files', () => {
            const path = globJoin(coursePaths[0], 'course.adoc')

            expect(existsSync(path)).toBe(true)
        })
    })
})
