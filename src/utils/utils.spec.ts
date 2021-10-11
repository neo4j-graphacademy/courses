import { mergeDeep } from "."

/* global describe, it */
describe('utils', () => {
    describe('mergeDeep', () => {
        it('should deep merge objects', () => {
            const first = {
                a: 1,
                b: { c: 2, e: 5}
            }

            const second = {
                b: {
                    c: 3,
                    d: 4,
                }
            }

            const output = mergeDeep(first, second)

            expect(output).toEqual({
                a: 1,
                b: {
                    c: 3,
                    d: 4,
                    e: 5
                }
            })
        })
    })

})