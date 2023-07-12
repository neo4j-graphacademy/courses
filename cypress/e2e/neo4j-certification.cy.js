
import { getDriver } from '../support/course.commands'


describe('neo4j-certification', () => {
    const driver = getDriver()

    let course

    before(() => cy.getCourseDetails('neo4j-certification').then(output => course = output[0]))
    after(() => driver.close())

    it('should enrol and unenrol', () => {
        cy.setup()
        cy.login()

        cy.log(course)
        cy.enrol(course)

        // Back to course
        cy.visit(course.link)

        // Exam in progress, disable link
        cy.get('.btn--disabled').contains('Exam in Progress').should('be.visible')

        // Unenroll
        cy.unenrol(course)

        // Should be able to enrol again
        cy.get('.btn--enrol').contains('Take Certification').should('be.visible').click()

        // Exam in progress
        cy.visit(course.link)
        cy.get('.btn--disabled').contains('Exam in Progress').should('be.visible')

        cy.reload()
        cy.get('.btn--disabled').contains('Exam in Progress').should('be.visible')

    })

    it('should not allow immediate retake', () => {
        cy.setup()
        cy.login()

        cy.enrol(course)

        // Back to course
        cy.visit(course.link)

        cy.get('.btn--disabled').contains('Exam in Progress').should('be.visible')

        // Fail in DB Link in DB
        cy.log('Marking certificate as failed')
            .then(() => {
                cy.wrap(driver.executeQuery(`
                MATCH (u:User {email: $email})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c:Course {slug: $course})
                SET e:FailedEnrolment, e.failedAt = datetime()
                RETURN e
            `, {
                    email: Cypress.env('user_email'),
                    course: course.slug,
                }).then(({ records }) => records[0].get('e'))
                ).should('be.an', 'object')

                cy.visit(course.link)

                cy.get('.btn--disabled').contains('Retake Certification').should('be.visible')
                cy.get('.body-small.text-muted').contains('You may try again').should('be.visible')
            })

    })

    it('should not allow retake after 12 hours', () => {
        cy.setup()
        cy.login()

        cy.enrol(course)

        // Back to course
        cy.visit(course.link)

        cy.get('.btn--disabled').contains('Exam in Progress').should('be.visible')

        // Fail in DB Link in DB
        cy.log('Marking certificate as failed, 12 hours ago')
            .then(() => {
                cy.wrap(driver.executeQuery(`
                MATCH (u:User {email: $email})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c:Course {slug: $course})
                SET e:FailedEnrolment, e.failedAt = datetime() - duration('PT12H')
                RETURN e
            `, {
                    email: Cypress.env('user_email'),
                    course: course.slug,
                }).then(({ records }) => records[0].get('e'))
                ).should('be.an', 'object')

                cy.visit(course.link)

                cy.get('.btn--disabled').contains('Retake Certification').should('be.visible')
                cy.get('.body-small.text-muted').contains('in 12 hours').should('be.visible')
            })
    })

    it('should allow a retake after 24 hours', () => {
        cy.setup()
        cy.login()

        cy.enrol(course)

        // Back to course
        cy.visit(course.link)

        cy.get('.btn--disabled').contains('Exam in Progress').should('be.visible')

        // Fail in DB Link in DB
        cy.log('Marking certificate as failed, 3 days ago')
            .then(() => {
                cy.wrap(driver.executeQuery(`
                MATCH (u:User {email: $email})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c:Course {slug: $course})
                SET e:FailedEnrolment, e.failedAt = datetime() - duration('P3D')
                RETURN e
            `, {
                    email: Cypress.env('user_email'),
                    course: course.slug,
                }).then(({ records }) => records[0].get('e'))
                ).should('be.an', 'object')


                cy.visit(course.link)

                // Should be able to retake
                cy.get('.btn--enrol').contains('Retake Certification').should('be.visible').click()

                cy.wait(1000)

                // Should be pending results
                cy.visit(course.link)

                cy.get('.btn--disabled').contains('Exam in Progress').should('be.visible')
            })
    })

    it('should show certificate once passed', () => {
        cy.setup()
        cy.login()

        cy.enrol(course)

        // Back to course
        cy.visit(course.link)

        cy.get('.btn--disabled').contains('Exam in Progress').should('be.visible')

        // Fail in DB Link in DB
        const percentage = 99
        cy.log('Marking certificate as completed')
            .then(() => {
                cy.wrap(driver.executeQuery(`
                    MATCH (u:User {email: $email})-[:HAS_ENROLMENT]->(e)-[:FOR_COURSE]->(c:Course {slug: $course})
                    REMOVE e:FailedEnrolment, e.failedAt
                    SET e:CompletedEnrolment, e.completedAt = datetime(), e.percentage = toInteger($percentage)
                    RETURN e
            `, {
                    email: Cypress.env('user_email'),
                    course: course.slug,
                    percentage,
                }).then(({ records }) => records[0].get('e'))
                ).should('be.an', 'object')

                // Should have a result
                cy.visit(course.link)

                // Should have certificate available
                cy.get('.btn--primary').contains('View Certificate').should('be.visible').click()

                // Should have pass percentage on certificate
                cy.get('.certificate-percentage').contains(`${percentage}%`)
            })
    })

})
