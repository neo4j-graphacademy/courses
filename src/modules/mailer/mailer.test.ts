import dotenv from 'dotenv'
import { send, prepareAndSend, isEnabled } from './mailer'
import { readFileSync } from 'fs'

dotenv.config()

describe('mailer', () => {
    describe('isEnabled', () => {
        it('should return true', () => {
            const result = isEnabled()
            expect(result).toBe(true)
        })
    })

    describe('send', () => {
        it('should send a HTML email', async () => {
            // Execute
            await send(
                'adam.cowley@neo4j.com',
                'Integration Test Email',
                '<h1>Test Email</h1><p>This is a test email from the integration test.</p>',
                'integration-test'
            )
        }, 10000)

        it('should send an email with an attachment', async () => {
            // Execute
            await send(
                'adam.cowley@neo4j.com',
                'Integration Test Email with attachment',
                '<h1>Test Email</h1><p>This is a test email from the integration test.</p>',
                'integration-test',
                [
                    {
                        filename: 'test.txt',
                        content: 'test',
                    },
                ]
            )
        }, 10000)
    })

    describe('prepareAndSend', () => {
        it('should prepare and send an email with flattened attributes', async () => {
            // Setup test data
            const filename = 'user-enrolled' as const
            const email = 'adam.cowley@neo4j.com'
            const data = {
                user: {
                    name: 'Test User',
                    email: 'adam.cowley@neo4j.com'
                },
                course: {
                    title: 'Test Course',
                    slug: 'test-course'
                }
            }

            // Execute
            await prepareAndSend(
                filename,
                email,
                data,
                '',
                'test-tag'
            )
        }, 10000)

        it('should prepare and send an email with attachments', async () => {
            // Setup test data
            const filename = 'user-completed-course' as const
            const email = 'adam.cowley@neo4j.com'
            const data = {
                user: {
                    name: 'Test User',
                    email: 'adam.cowley@neo4j.com'
                },
                course: {
                    title: 'Test Course',
                    slug: 'test-course'
                }
            }
            const attachments = [{
                filename: 'file.pdf',
                content: readFileSync('/Users/adam/graphacademy/courses/asciidoc/courses/neo4j-fundamentals/summary.pdf').toString('base64'),
            }]

            // Execute
            await prepareAndSend(
                filename,
                email,
                data,
                '',
                'test-tag',
                attachments
            )
        }, 10000)
    })
})
