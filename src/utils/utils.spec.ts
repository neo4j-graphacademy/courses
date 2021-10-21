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

        it('should handle real world scenario', () => {
            const baseOptions = {
                // TODO: Note: this is dangerous once we start including remote files
                safe: 'unsafe',
                backend: 'html5',
                template_dir: 'TEMPLATE_DIR',
                attributes: {
                    shared: 'SHARED_PATH',
                },
            }

            const extended = {
                attributes: {
                    course_title: 'COURSE_TITLE'
                }
            }

            const other = {
                to_file: true
            }

            const output = mergeDeep(baseOptions, extended, other)

            const expected = {
                safe: 'unsafe',
                backend: 'html5',
                template_dir: 'TEMPLATE_DIR',
                attributes: {
                    shared: 'SHARED_PATH',
                    course_title: 'COURSE_TITLE'
                },
                to_file: true,
            }

            expect(output).toEqual(expected)
        })
    })

})