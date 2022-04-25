Cypress.Commands.add('attemptLesson', lesson => {
    // Go to page
    cy.visit(lesson.link)

    // Check URL
    cy.url().should('contain', lesson.link)

    // Check Lesson Title
    cy.get('.classroom-content h1').contains(lesson.title)




    // Conditional Checks
    cy.get('body')
        .then($body => {
            // Check all links open in a new window
            if ( $body.find('.module-content a:not([href^="#"])').length > 0) {
                cy.checkClassroomLinks()
            }

            // Check Video and transcript tabs
            if ( $body.find('#transcript').length > 0 && $body.find('#video').length > 0 ) {
                cy.checkVideoTabs()
            }


            // Mark as read?
            if ( $body.find('.btn-read').length > 0 ) {
                cy.markAsRead(lesson)
            }

            else if ( $body.find('.btn-verify').length > 0 ) {
                cy.attemptVerification(lesson)
            }

            // Answer Questions?
            else if ( $body.find('.section.question').length ) {
                // Provide incorrect answer(s)
                cy.failLesson()

                // Check hint buttons
                cy.get('.section.question')
                    .within(() => {
                        // Check Show Hint button
                        cy.get('.admonition-show-hint')
                            .should('exist').click({multiple: true})

                        // Clicking shold show the hint
                        cy.get('.hint').should('be.visible')
                    })


                // Provide incorrect answer(s) twice more to reveal solution button
                // TODO: Make this mandatory for all courses!
                if ( $body.find('.solution').length ) {
                    cy.failLesson()

                    // Check solution buttons
                    cy.get('.section.question')
                        .within(() => {
                            // Check Show Solution button
                            cy.get('.admonition-show-solution')
                            .should('exist').click({multiple: true})

                            // Clicking shold show the solution
                            cy.get('.solution').should('be.visible')
                        })

                    cy.failLesson()

                    cy.get('.section.question')
                        .within(() => {
                            // Clicking shold show the solution
                            cy.get('.solution').should('be.visible')
                        })

                }

                // Provide Correct Answer(s)
                cy.passLesson()

                // Check Congratulations! Modal
                if (lesson.next) {
                    cy.checkLessonSuccessfulOutcome(lesson.next)
                }
                else {
                    cy.checkCourseCompletedOutcome()
                }
            }
            else {
                cy.fail('oops')
                console.log('Dont know how to handle: ', lesson.link);
            }
        })
})

Cypress.Commands.add('checkClassroomLinks', () => {
    cy.get('.module-content a:not([href^="#"])')
        .should('have.attr', 'target')
        .and('eq', '_blank')
})

Cypress.Commands.add('attemptVerification', (lesson) => {
    // Fail Verification
    cy.get('.btn-verify').click()

    // Check Hint
    cy.get('.admonition-show-hint')
        .should('exist').click({multiple: true})

    // Clicking shold show the hint
    cy.get('.hint').should('be.visible')

    // Fail Verification
    cy.get('.btn-verify').click()

    // Check (Optional) Solution
    cy.get('body')
        .then($body => {
            if ( $body.find('.solution').length ) {
                cy.get('.admonition-show-solution')
                    .should('exist').click({multiple: true})

                // Clicking shold show the solution
                cy.get('.solution').should('be.visible')
            }
        })

    // Get and run solution.cypher
    cy.request(`${lesson.link}solution.cypher`)
        .then(response => {
            cy.log(response.body)

            // Execute the solution Cypher in the Sandbox
            cy.executeCypher(response.body)

            cy.wait(5000)

            // Pass Lesson
            cy.get('.btn-verify').click()

            // Check verified & go to next
            if (lesson.next) {
                cy.checkLessonSuccessfulOutcome(lesson.next)
            }
            else {
                cy.checkCourseCompletedOutcome()
            }
        })
})

Cypress.Commands.add('failLesson', () => {
    cy.get('.section.question').each(($el, index, $list) => {
        const config = JSON.parse($el.attr('data-question'))

        /**
         * type: 'select-in-source' | 'input-in-source' | 'freetext'
         * multiple: boolean,
         * options: [{ value: string, correct: boolean }]
         */
        const { type, multiple, options } = config
        const incorrect = options.filter(option => !option.correct)
        const correct = options.filter(option => option.correct)

        cy.setAnswer(index, type, multiple ? options: incorrect, multiple)

        // TODO: Check indicators
    })


    // Submit
    // TODO: Intercept request and check the response
    cy.get('.btn-submit').click()
        // Loading state
        // .should('have.class', 'btn-loading')
        // .should('not.have.class', 'btn-loading')
        .should('contain', 'Try again')


    // Error block
    cy.get('.lesson-outcome--failed')
        .should('exist')

    // Check questions are highlighted
    cy.get('.section.question').each(($el) => {
        expect($el.attr('class')).contains('question--incorrect')
        // TODO: Check multiple choice for incorrect answers
    })
})

Cypress.Commands.add('passLesson', () => {
    cy.get('.section.question').each(($el, index, $list) => {
        const config = JSON.parse($el.attr('data-question'))

        /**
         * type: 'select-in-source' | 'input-in-source' | 'freetext'
         * multiple: boolean,
         * options: [{ value: string, correct: boolean }]
         */
        const { type, multiple, options } = config
        const correct = options.filter(option => option.correct)

        cy.setAnswer(index, type, correct, multiple)
    })

    // Submit
    cy.get('.btn-submit').click()

    // Error block should be removed
    cy.get('.lesson-outcome--failed')
        .should('not.exist')
})


Cypress.Commands.add('checkAndShowHint', $question => {
    // Show hint button
    cy.get('.admonition-show-hint', { withinSubject: $question }).scrollIntoView().should('exist').click()

    // Clicking shold show the hint
    cy.get('.hint').should('be.visible')
})

Cypress.Commands.add('checkAndShowSolution', () => {
    // Show hint button
    cy.get('.admonition-show-solution')
        .should('exist')
        .click({})

    cy.get('.solution').should('exist')
})

Cypress.Commands.add('setAnswer', (index, type, options, multiple) => {
    cy.get('.question').eq(index)
        .within(() => {
            // Uncheck any checkboxes
            if ( multiple ) {
                cy.get('input[type=checkbox]').uncheck({force: true})
            }

            options.forEach(option => {
                if (type === 'select-in-source') {
                    cy.get('select').select(option.value)
                }
                else if (type === 'freetext') {
                    cy.get('input, textarea').clear().type(option.value)
                }
                else {
                    // cy.get('.question-option').contains(option.value).click()
                    cy.get('.question-option input[value="'+ option.value +'"]').check()

                }
            })
        })
})

Cypress.Commands.add('checkLessonSuccessfulOutcome', next => {
    cy.get('.module-outcome').should('exist')
    cy.get('.module-outcome-actions .btn-primary').should('exist')

    // Check link to next module if necessary
    if ( next ) {
        cy.get('.module-outcome-actions .btn-primary').should('have.attr', 'href', next)
    }

    // Close Modal
    cy.get('.modal-outcome-close').click()
    cy.get('.module-outcome').should('not.exist')
})

Cypress.Commands.add('checkCourseCompletedOutcome', () => {
    cy.get('.module-outcome').should('exist')
    cy.get('.module-outcome-actions .btn-primary').should('exist')

    // Check links in modal
    cy.get('.module-outcome-actions .btn-secondary').contains('Certificate')
    cy.get('.module-outcome-actions .btn-primary').contains('Summary')


    // Close Modal
    cy.get('.modal-outcome-close').click()
    cy.get('.module-outcome').should('not.exist')
})

