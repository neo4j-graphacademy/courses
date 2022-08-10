import { flattenAttributes, mergeDeep, sortCourses, toCamelCase } from '.'
import { Course } from '../domain/model/course'

/* global describe, it */
describe('utils', () => {
    describe('mergeDeep', () => {
        it('should deep merge objects', () => {
            const first = {
                a: 1,
                b: { c: 2, e: 5 },
            }

            const second = {
                b: {
                    c: 3,
                    d: 4,
                },
            }

            const output = mergeDeep(first, second)

            expect(output).toEqual({
                a: 1,
                b: {
                    c: 3,
                    d: 4,
                    e: 5,
                },
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
                    course_title: 'COURSE_TITLE',
                },
            }

            const other = {
                to_file: true,
            }

            const output = mergeDeep(baseOptions, extended, other)

            const expected = {
                safe: 'unsafe',
                backend: 'html5',
                template_dir: 'TEMPLATE_DIR',
                attributes: {
                    shared: 'SHARED_PATH',
                    course_title: 'COURSE_TITLE',
                },
                to_file: true,
            }

            expect(output).toEqual(expected)
        })
    })

    describe('toCamelCase', () => {
        it('should convert a string to camel case', () => {
            const input = 'this string'
            const expected = 'thisString'

            const output = toCamelCase(input)

            expect(output).toEqual(expected)
        })

        it('should convert first character to lower case', () => {
            const input = 'THIS.string-with-Punctuation!'
            const expected = 'thisStringWithPunctuation'

            const output = toCamelCase(input)

            expect(output).toEqual(expected)
        })
    })

    describe('sortCourses', () => {
        it('should sort courses by status before order', () => {
            const courses: Partial<Course>[] = [
                { title: 'Draft 2', status: 'draft', order: 4 },
                { title: 'Active 1', status: 'active', order: 2 },
                { title: 'Active 2', status: 'active', order: 3 },
                { title: 'Draft 1', status: 'draft', order: 1 },
            ]

            const expected = ['Active 1', 'Active 2', 'Draft 1', 'Draft 2']

            sortCourses(courses as Course[])

            // Check Order
            const titles = courses.map((course) => course.title)
            expect(titles).toEqual(expected)
        })
    })

    describe('flattenAttributes', () => {
        it('should flatten a nested object', () => {
            const input = {
                user: {
                    name: 'Test',
                    location: {
                        name: 'London',
                    },
                    age: 20,
                },
                token: 'string',
            }
            const expected = {
                user_name: 'Test',
                user_location_name: 'London',
                user_age: '20',
                token: 'string',
            }

            const output = flattenAttributes(input)

            expect(output).toEqual(expected)
        })
    })
})
