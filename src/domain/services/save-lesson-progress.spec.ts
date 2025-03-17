import { emitter } from '../../../events'
import initNeo4j, { close, write, writeTransaction } from '../../../modules/neo4j'
import { User } from '../../model/user'
import { saveLessonProgress } from '../save-lesson-progress'
import { UserCompletedCourse, CompletionSource } from '../../events/UserCompletedCourse'
import { enrolInCourse } from '../enrol-in-course'
import { getUserEnrolments } from '../get-user-enrolments'
import { LessonWithProgress } from '../../model/lesson'
import { Answer } from '../../model/answer'

describe('saveLessonProgress', () => {
    let testUser: User
    let courseSlug = 'neo4j-fundamentals'
    let completionEventFired = false
    let lastCompletionEvent: UserCompletedCourse | null = null
    let result: LessonWithProgress & { answers: Answer[] }


    beforeAll(async () => {
        const {
            NEO4J_HOST,
            NEO4J_USERNAME,
            NEO4J_PASSWORD,
        } = process.env

        await initNeo4j(NEO4J_HOST as string, NEO4J_USERNAME as string, NEO4J_PASSWORD as string)

        // Create test user and enrolments
        testUser = {
            id: 'test-user-' + Math.floor(Math.random() * 1000000),
            sub: 'auth0|test-user-' + Math.floor(Math.random() * 1000000),
            email: 'test@example.com',
            email_verified: true,
            name: 'Test User',
            profileCompletedAt: new Date(),
            givenName: 'Test',
            unsubscribed: false,
            featureFlags: [],
            isNeo4jEmployee: false
        }

        // Set up test data in database
        await writeTransaction(async (tx) => {
            // // Delete last test user and any enrolments
            // await tx.run(`
            //     MATCH (u:User {sub: $sub})
            //     FOREACH (e IN [ (u)-[:HAS_ENROLMENT]->(e:Enrolment) | e ] | DETACH DELETE e)
            //     DETACH DELETE u
            // `, { sub: testUser.sub })

            await enrolInCourse(courseSlug, testUser, 'token', 'ref')
        })
        console.log('testUser', testUser)
    })

    afterAll(close)

    it('should progress through lessons and fire completion event', async () => {
        // Set up event listener for course completion
        emitter.on(UserCompletedCourse, (event: UserCompletedCourse) => {
            completionEventFired = true
            lastCompletionEvent = event
        })

        // Get course structure
        const courseStructure = await writeTransaction(async (tx) => {
            const result = await tx.run(`
                MATCH (c:Course {slug: $courseSlug})-[:HAS_MODULE]->(m)-[:HAS_LESSON]->(l)
                WHERE NOT l:OptionalLesson
                RETURN m.slug as moduleSlug, l.slug as lessonSlug, [ (l)-[:HAS_QUESTION]->(q) | q { .id } ] as questions
                ORDER BY m.order, l.order
            `, { courseSlug })

            return result.records.map(record => record.toObject())
        })


        for (const entry of courseStructure) {
            result = await saveLessonProgress(
                testUser,
                courseSlug,
                entry.moduleSlug,
                entry.lessonSlug,
                entry.questions.map(question => ({
                    id: question.id,
                    correct: true,
                    answers: [],
                })),
                'test-token',
                'ref',
                true
            )

            expect(result.completed).toBe(true)
        }

        // Expect last lesson to have a certificateId
        expect(result.certificateId).toBeDefined()

        expect(completionEventFired).toBe(true)
        expect(lastCompletionEvent?.user.sub).toBe(testUser.sub)
        expect(lastCompletionEvent?.course.slug).toBe(courseSlug)
        expect(lastCompletionEvent?.course.certificateId).toBeDefined()

        expect(lastCompletionEvent?.source).toBe(CompletionSource.WEBSITE)

        // Check certificateId matches what was in the database 

        const res = await getUserEnrolments(testUser.sub, 'sub', courseSlug)

        expect(res.enrolments.completed).toBeDefined()
        expect(res.enrolments.completed?.length).toBe(1)
        expect(res.enrolments.completed?.[0].certificateId).toBe(lastCompletionEvent?.course.certificateId)
        expect(res.enrolments.completed?.[0].certificateId).toBe(result.certificateId)

        console.log(lastCompletionEvent?.course.certificateId)
    })
}) 