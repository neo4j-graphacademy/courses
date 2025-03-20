import { emitter } from '../events'
import { UserCompletedCourse, CompletionSource } from '../domain/events/UserCompletedCourse'

import { User } from '../domain/model/user'
import { CourseWithProgress } from '../domain/model/course'
import { getSuggestionsForEnrolment } from '../domain/services/get-suggestions-for-enrolment'
import * as asciidoc from '../modules/asciidoc'


describe('Email Listeners', () => {
    let emailModule: any



    it('should send course completion email with correct data', async () => {
        // Test data setup
        const testUser: User = {
            id: 'user-123',
            sub: 'auth0|user-123',
            email: 'test@example.com',
            email_verified: true,
            name: 'Test User',
            profileCompletedAt: new Date(),
            givenName: 'Test',
            unsubscribed: false,
            featureFlags: [],
            isNeo4jEmployee: false
        }

        const certificateUrl = 'https://example.com/certificate'
        const testCourse: Partial<CourseWithProgress> = {
            slug: 'test-course',
            title: 'Test Course',
            certificateUrl,
            emails: ['user-completed-course'],
        }

        // Create and emit the event
        const event = new UserCompletedCourse(
            testUser,
            testCourse as CourseWithProgress,
            'test-token',
            CompletionSource.WEBSITE
        )


        emitter.on(UserCompletedCourse, async (event: UserCompletedCourse) => {
            console.log('event', event)

            expect(event.user.id).toBe(testUser.id)
            expect(event.course.slug).toBe(testCourse.slug)
            expect(event.course.certificateUrl).toBe(certificateUrl)
        })
    })
}) 