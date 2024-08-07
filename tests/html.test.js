const { readFileSync } = require("fs")
const { globSync } = require("glob")
const { globJoin } = require("./utils")

describe('html generation', () => {
  const files = globSync(
    globJoin(__dirname, '..', 'build', '**', '*.html')
  )

  for (const file of files) {
    describe(file, () => {
      it('should not have an unresolved directive', () => {
        const buffer = readFileSync(file)
        const text = buffer.toString()

        expect(text).not.toContain('unresolved directive')
      })
    })
  }

})