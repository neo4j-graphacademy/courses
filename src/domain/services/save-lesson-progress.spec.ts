import { emitter } from '../../events'
import initNeo4j, { close, write, writeTransaction } from '../../modules/neo4j'
import { User } from '../model/user'
import { saveLessonProgress } from './save-lesson-progress'
import { UserCompletedCourse, CompletionSource } from '../events/UserCompletedCourse'
import { enrolInCourse } from './enrol-in-course'
import { getUserEnrolments } from './get-user-enrolments'
import { LessonWithProgress } from '../model/lesson'
import { Answer } from '../model/answer'

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
    })

    afterAll(close)

    it('should progress through lessons and fire completion event with correct certificateId', async () => {
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

        // Complete all lessons except the last one
        for (const entry of courseStructure.slice(0, -1)) {
            await saveLessonProgress(
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
        }

        // Complete the final lesson which should trigger course completion
        const lastLesson = courseStructure[courseStructure.length - 1]
        result = await saveLessonProgress(
            testUser,
            courseSlug,
            lastLesson.moduleSlug,
            lastLesson.lessonSlug,
            lastLesson.questions.map(question => ({
                id: question.id,
                correct: true,
                answers: [],
            })),
            'test-token',
            'ref',
            true
        )

        // Get the actual certificate ID from the database
        const enrolments = await getUserEnrolments(testUser.sub, 'sub', courseSlug)
        const dbCertificateId = enrolments.enrolments.completed?.[0].certificateId

        // Verify completion event was fired with fresh course data
        expect(completionEventFired).toBe(true)
        expect(lastCompletionEvent).toBeDefined()
        expect(lastCompletionEvent?.user.sub).toBe(testUser.sub)
        expect(lastCompletionEvent?.course.slug).toBe(courseSlug)
        expect(lastCompletionEvent?.source).toBe(CompletionSource.WEBSITE)

        // Verify certificate IDs match between event and database
        expect(lastCompletionEvent?.course.certificateId).toBeDefined()
        expect(lastCompletionEvent?.course.certificateId).toBe(dbCertificateId)

        // The result from saveLessonProgress should also have the correct certificateId
        expect(result.certificateId).toBeDefined()
        expect(result.certificateId).toBe(dbCertificateId)
    })
}) 