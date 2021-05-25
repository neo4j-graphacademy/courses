describe('Test Course', () => {
    it('should log in', () => {
        // Login
        cy.visit('http://localhost:3000/test')

        cy.intercept({ method: 'POST', url: '/callback' }).as('callback')
        cy.intercept({ method: 'POST', url: '/courses/*/*/*' }).as('answer')
        cy.intercept({ method: 'POST', url: '/courses/*/*/*/verify' }).as('verify')

        cy.get('.navbar-login')
            .click()

        // Log in to Auth0
        // cy.get('.auth0-lock-input-email input').type('adam+graphacademy@neo4j.com')
        // cy.get('.auth0-lock-input-show-password input').type('GraphAcademy2021')
        // cy.get('.auth0-lock-submit').click()

        // Hack: Intercept and set cookie
        cy.wait('@callback').should(({ response }) => {
            const cookie = response.headers['set-cookie'].find(cookie => cookie.startsWith('appSession'));

            const [name, payload] = cookie.split('=')
            const [value] = payload.split(';')

            cy.setCookie(name, value)

            cy.reload()
        })

        cy.get('.navbar-account')
            .contains('Hey')


        // Open course page
        cy.contains('.card a', 'Test Course')
            .click()

        cy.get('.course-header h1').should('contain', 'Test Course')

        //  Click Enrol
        cy.contains('.btn', 'Enrol').click()
        // cy.contains('.btn', 'Continue').click()

        /**
         * 1. Overview Module
         */
        // Should be on first course
        cy.get('.module-title').should('contain', 'Overview Module')

        /**
         * 1.1 Expanding Sandbox
         */
        // Go to first lesson
        cy.get('.pagination-link--next a').click()

        // Should have a visible sandbox
        cy.get('.lesson-sandbox').should('have.class', 'lesson-sandbox--visible')


        // Mark lesson as read
        cy.markAsRead()

        // Status should be saved
        cy.verifyLessonPassed()

        cy.next()

        /**
         * 1.2 Mark Lesson As Read
         */

        // Toggle sandbo
        cy.get('.lesson-sandbox-toggle').click()
        cy.get('.lesson-sandbox').should('have.class', 'lesson-sandbox--visible')

        cy.get('.lesson-sandbox-toggle').click()
        cy.get('.lesson-sandbox').should('not.have.class', 'lesson-sandbox--visible')

        cy.markAsRead()
        cy.get('.lesson-outcome--passed a.lesson-outcome-progress').click()


        /**
         * 2. Question Types
         */
        cy.get('.module-title').should('contain', 'Question Types')

        cy.next()


        /**
         * 2.1 Single Choice Question
         */
        // Incorrect answer
        cy.get('input[type="radio"]').last().check()
        cy.get('.btn-submit').click()

        // Failed
        cy.wait('@answer')
        cy.verifyLessonFailed()

        cy.get('input[type="radio"]').last()
            .parents('.question-option')
            .should('have.class', 'question-option--incorrect')

        // Click show hint button to reveal hint
        cy.get('.admonition-show')
            .should('be.visible')
            .click()

        cy.get('.admonition').should('be.visible')

        // Correct answer
        cy.get('input[type="radio"]').first().check()
        cy.get('.btn-submit').click()


        cy.wait('@answer')

        // - remove incorrect state from incorrect nodes
        cy.get('input[type="radio"]').last()
            .parents('.question-option')
            .should('not.have.class', 'question-option--incorrect')

        // - add correct state from incorrect nodes
        cy.get('input[type="radio"]').first()
            .parents('.question-option')
            .should('have.class', 'question-option--correct')

        cy.get('.question').should('have.class', 'question--correct')

        cy.get('.lesson-outcome--passed').should('exist')
        cy.get('.lesson-outcome--passed a').should('exist').click()

        /**
         * 2.2 Multiple Question
         */
        // Incorrect answer #1
        cy.get('input[type="checkbox"]').first().check()
        cy.get('.btn-submit').click()

        cy.verifyLessonFailed()

        cy.wait('@answer')

        cy.get('input[type="checkbox"]').first().uncheck().parents('.question-option')
            .should('have.class', 'question-option--incorrect')

        // Combination of correct and incorrect answers
        cy.get('input[type="checkbox"]').last().check()
        cy.get('input[type="checkbox"]').eq(1).check()

        cy.get('.btn-submit').click()

        cy.wait('@answer')

        cy.get('input[type="checkbox"]').eq(1).parents('.question-option')
            .should('have.class', 'question-option--correct')
        cy.get('input[type="checkbox"]').last().uncheck().parents('.question-option')
            .should('have.class', 'question-option--incorrect')


        // Correct Answers
        cy.get('input[type="checkbox"]').eq(2).check()

        cy.get('.btn-submit').click()
        cy.wait('@answer')

        cy.nextLesson()

        /**
         * 2.3 Select in Code
         */
        // Incorrect
        // TODO: Stop asciidoctor from adding ligatures
        cy.get('select').select('-[:ACTED_IN]→')

        cy.get('.btn-submit').click()
        cy.wait('@answer')

        cy.verifyLessonFailed()


        // Correct
        cy.get('select').select('←[:ACTED_IN]-')

        cy.get('.btn-submit').click()
        cy.wait('@answer')

        cy.verifyLessonPassed(false)
        cy.nextLesson()


        /**
         * 2.4 Input in Code
         */
        // Incorrect
        cy.get('input').type('Foo')

        cy.get('.btn-submit').click()
        cy.wait('@answer')
        cy.verifyLessonFailed()

        // Correct
        cy.get('input').clear().type('Movie:Comedy')

        cy.get('.btn-submit').click()
        cy.wait('@answer')
        cy.verifyLessonPassed(false)

        cy.nextLesson()

        /**
         * 2.5 Free Text
         */
        // Incorrect
        cy.get('input').type('Foo')

        cy.get('.btn-submit').click()
        cy.wait('@answer')
        cy.verifyLessonFailed()

        // Correct
        cy.get('input').clear().type('Adam')

        cy.get('.btn-submit').click()
        cy.wait('@answer')
        cy.verifyLessonPassed(false)

        cy.nextLesson()

        /**
         * 2.6 Database Verification
         */
        // Correct
        cy.get('.verify .btn').click()
        cy.wait('@verify')

        cy.get('.lesson-outcome--passed').should('exist')
        cy.reload()

        /**
         * Verify completion
         */
        cy.get('.course-completed').should('exist')
        cy.get('.course-completed a').click()

        /**
         * Certificate
         */
        cy.contains('p', 'has completed').should('exist')

        cy.contains('a', 'My Achievements').click()
        cy.get('.achievement-group--completed').should('contain', 'Test Course')

        /**
         * Logout
         */
        // cy.get('.navbar-account').parent().trigger('mouseover')
        // cy.get('.navbar-logout').click()
        cy.visit('http://localhost:3000/logout')
    })
})