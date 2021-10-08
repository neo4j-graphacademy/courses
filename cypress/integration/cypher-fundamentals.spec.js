describe('Test Course', () => {
    after(() => {
        cy.visit('/logout')
    })

    it('should enrol and complete course', () => {
        // Login
        cy.visit(`${Cypress.env('setup_url')}?email=${encodeURIComponent(Cypress.env('user_email'))}`)

        cy.intercept({ method: 'POST', url: '/callback' }).as('callback')
        cy.intercept({ method: 'POST', url: '/courses/*/*/*' }).as('answer')
        cy.intercept({ method: 'POST', url: '/courses/*/*/*/verify' }).as('verify')

        // If this step fails, open up http://localhost:3000 in the Cypress browser, click 'Sign In', then 'My Account' > 'Sign Out'
        cy.get('.navbar-login')
            .click()

        // Log in to Auth0
        cy.get('.auth0-lock-input-email input').type(Cypress.env('user_email'))
        cy.get('.auth0-lock-input-show-password input').type(Cypress.env('user_password'))
        cy.get('.auth0-lock-submit').click()

        // Hack: Intercept and set cookie
        cy.wait('@callback').should(({ response }) => {
            const cookie = response.headers['set-cookie'].find(cookie => cookie.startsWith('appSession'));

            const [name, payload] = cookie.split('=')
            const [value] = payload.split(';')

            cy.setCookie(name, value)

            cy.reload()
        })

        // The user should now be logged in
        cy.get('.navbar-account')
            .contains('My Account')


        // Open course page
        cy.contains('.card a', Cypress.env('cypher_course_title'))
            .click()

        cy.get('.course-container .hero h1').should('contain', Cypress.env('cypher_course_title'))

        //  Click Enrol
        cy.contains('.btn', 'Enrol').click()


        /**
         * 1. Reading Data from Neo4j
         */
/*
        // - Check title matches with current link in TOC
        cy.get('.module-title h1').invoke('text').then(text => {
            cy.get('.toc-module--current').contains(text)
        })

        // - Click next on pagination
        cy.paginationNext()


        // 1.1 Introduction to Cypher

        // - check tabs
        cy.checkVideoTabs()

        // - Questions

        // -- test submit with no answers
        cy.get('.btn-submit').click()

        cy.get('.question').each($el => {
            cy.wrap($el).should('have.class', 'question--incorrect')
        })

        cy.resetQuestionState()


        // -- 1.1.1 - Read Data
        cy.submitQuiz([
            [ {value: 'FIND', correct: false} ]
        ])

        cy.verifyQuestions([
            false
        ])

        cy.submitQuiz([
            [ {value: 'MATCH', correct: false} ],
            [ {value: 'FILTER', correct: false} ],
        ])

        cy.verifyQuestions([
            false,
            false
        ])

        cy.submitQuiz([
            [ {value: 'MATCH', correct: true} ],
            [ {value: 'FILTER', correct: false} ],
        ])

        cy.verifyQuestions([
            true,
            false
        ])

        cy.submitQuiz([
            [ {value: 'MATCH', correct: true} ],
            [ {value: 'FILTER', correct: false} ],
            [ {value: 'SELECT m.title = \'The Matrix\'', correct: false, type: 'select'} ],
        ])

        cy.verifyQuestions([
            true,
            false,
            false,
        ])

        cy.submitQuiz([
            [ {value: 'MATCH', correct: true} ],
            [ {value: 'WHERE', correct: true} ],
            [ {value: 'SELECT m.title = \'The Matrix\'', correct: false, type: 'select'} ],
        ])


        cy.verifyQuestions([
            true,
            true,
            false,
        ])

        cy.submitQuiz([
            [ {value: 'MATCH', correct: true} ],
            [ {value: 'WHERE', correct: true} ],
            [ {value: 'WHERE m.title = \'The Matrix\'', correct: true, type: 'select'} ],
        ])

        cy.verifyLessonPassed(true)
        cy.advanceFromModuleOutcome()



        // 1.2 Retrieving Nodes
        cy.submitQuiz([
            [ { type: 'text', value: '1987'} ]
        ])

        cy.verifyQuestions([false])

        cy.submitQuiz([
            [ { type: 'text', value: '1958'} ]
        ])
        cy.verifyLessonPassed(true)
        cy.advanceFromModuleOutcome()


        // 1.3 Finding Relationships
        cy.submitQuiz([
            [ { type: 'select', value: '<-[:ACTED_IN]-'} ],
            [
                { type: 'checkbox', value: `MATCH (m:Movie {title: 'The Matrix'})<-[:DIRECTED]-(p:Person) RETURN p.name`},
                { type: 'checkbox', value: `MATCH (m:Movie {title: 'The Matrix'})<-[:DIRECTED]-(p) RETURN p.name`},
            ],
        ])

        cy.verifyLessonPassed(true)
        cy.advanceFromModuleOutcome()


        // 1.4 Traversing Relationships
        cy.submitQuiz([
            [ { type: 'text', value: '2'} ]
        ])

        cy.verifyQuestions([false])

        cy.submitQuiz([
            [ { type: 'text', value: '3'} ]
        ])
        cy.verifyLessonPassed(true)
        cy.advanceFromModuleOutcome()


        // 1.5 Finding Emil
        cy.submitQuiz([
            [ { type: 'text', value: 'The Matrix'} ]
        ])

        cy.verifyLessonPassed(true)
        cy.advanceFromModuleOutcome()



        cy.visit('/courses/cypher-fundamentals/1-reading/6-filtering-queries/')


        // 1.6 Filtering Queries
        cy.submitQuiz([
            [ { type: 'select', value: 'IN'} ],
            [
                { type: 'checkbox', value: `WHERE a.born >= 1970 AND a.born < 1980`},
                { type: 'checkbox', value: `WHERE 1970`},
                { type: 'checkbox', value: `a.born IN`},
            ],
        ])

        cy.verifyLessonPassed(true)
        cy.advanceFromModuleOutcome()

        // 1.7 Finding Specific Actors
        cy.submitQuiz([
            [ { type: 'text', value: '4'} ]
        ])

        cy.verifyLessonPassed(true)
        cy.advanceFromModuleOutcome()



        /**
         * 2. Writing Data to Neo4j
         */
/*
        // - Click next on pagination
        cy.paginationNext()

        // 2.1 Creating Nodes
        cy.submitQuiz([
            [
                { type: 'checkbox', value: 'CREATE'},
                { type: 'checkbox', value: 'MERGE'},
            ],
            [
                { type: 'checkbox', value: ' The label for the node.'},
                { type: 'checkbox', value: ' The name and value for the property that will be the primary key for the node.'},

            ]
        ])

        cy.verifyLessonPassed(true)
        cy.advanceFromModuleOutcome()


        cy.visit('/courses/cypher-fundamentals/2-writing/2-c-create-nodes/')

        // 2.2 Creating a Node
        // - incorrect answer
        cy.submitVerify()
        cy.verifyLessonFailed()


        // - correct answer
        cy.get('iframe.sandbox')
            .its('0.contentDocument.body')
            .within(() => {
                cy.executeCommand('MERGE (:Person {name: "Daniel Kaluuya"})', {parseSpecialCharSequences: false})
            })

        cy.wait(1000)

        cy.submitVerify()
        cy.verifyLessonPassed(true)
        cy.advanceFromModuleOutcome()
*/
cy.visit('/courses/cypher-fundamentals/2-writing/3-create-relationships/')
        // 2.3 Creating Relationships
        cy.submitQuiz([
            [
                { type: 'checkbox', value: 'MERGE'},
            ],
            [
                { type: 'checkbox', value: 'type for the'},
                { type: 'checkbox', value: 'references to the'},
            ],
            [ {type: 'select', value: '-[:ACTED_IN]->'} ],
        ])

        cy.verifyLessonPassed(true)
        cy.advanceFromModuleOutcome()


        // 2.4 Creating a Relationship
        // - incorrect answer
        cy.submitVerify()
        cy.verifyLessonFailed()

        // - correct answer
        cy.get('iframe.sandbox')
            .its('0.contentDocument.body')
            .within(() => {
                cy.executeCommand('MERGE (p:Person {name: "Daniel Kaluuya"}) MERGE (m:Movie {name: "Get Out"}) MERGE (p)-[:ACTED_IN]->(m)', {parseSpecialCharSequences: false})
            })

        cy.wait(2000)

        cy.submitVerify()
        cy.verifyLessonPassed(true)
        cy.advanceFromModuleOutcome()


        // 2.5 Updating Properties


        // 2.6 Adding Properties to a Movie


        // 2.7 Merge Processing


        // 2.8 Adding or Updating a Movie


        // 2.9 Deleting Data


        // 2.10 Deleting Emil



        /**
         * Course Summary
         */

        /**
         * Certificate
         */

        /**
         * Public Profile
         */


        cy.wait(10000)


        // /**
        //  * 1. Introduction to Graph Theory
        //  */
        // cy.get('.module-title').should('contain', Cypress.env('fundamentals_first_module_title'))

        // // Go to first lesson
        // cy.get('.pagination-link--next a').click()

        // /**
        //  * 1.1 Seven Bridges
        //  */
        // cy.get('iframe').should('be.visible')


        /**
         * 1.2 Graph Elements
         */

        /**
         * 1.3 Graph Structures
         */

        /**
         * 1.4. Graphs are Everywhere
         */

        /**
         * 2. Property Graphs
         */

        /**
         * 2.1 What is a Property Graph?
         */

        /**
         * 2.2 Native graph advantage
         */

        /**
         * 2.3 Native graph advantage
         */

    })
})