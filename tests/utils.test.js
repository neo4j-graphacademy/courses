const { getAttribute } = require('./utils')

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
})
