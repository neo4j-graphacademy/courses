// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('markAsRead', () => {
    cy.get('input[name="read"]').click()

    // Should have a continue link
    cy.get('.lesson-outcome--passed').should('exist')
    cy.get('.lesson-outcome--passed a.lesson-outcome-progress').should('exist')
})

Cypress.Commands.add('paginationNext', () => {
    cy.get('.pagination-link--next a').should('exist').click()
})

Cypress.Commands.add('checkLinks', () => {
    const ignore = [
        'tel:',
        '//neo4j.com',
    ]

    cy.get(".main a:not([href*='https:]']").each($el => {
        const href = $el.prop('href')
        const target = $el.prop('target')

        if (target === '' && href && href.length > 0) {
            if ( ignore.some(value => href.includes(value)) ) {
                return;
            }

            cy.request($el.prop('href'))
                .should((response) => {
                    expect(response.status).to.eq(200)
                })
        }
    })
})

Cypress.Commands.add('checkVideoTabs', () => {
    cy.get('.tab[href="#transcript"]').click().should('have.class', 'tab--selected')
    cy.get('#transcript').should('have.class', 'tab-target--visible')

    cy.get('.tab[href="#video"]').click().should('have.class', 'tab--selected')
    cy.get('#video').should('have.class', 'tab-target--visible')
})

Cypress.Commands.add('resetQuestionState', () => {
    cy.get('.question--incorrect').invoke('removeClass', '.question--incorrect')
    // cy.get('.question-option--incorrect').invoke('removeClass', '.question-option--incorrect')
})

Cypress.Commands.add('answerQuestion', (index, options) => {
    cy.get('.question').eq(index)
        .within(() => {
            options.forEach(option => {
                if (option.type === 'select') {
                    cy.get('select').select(option.value)
                }
                else if (option.type === 'text') {
                    cy.get('input, textarea').clear().type(option.value)
                }
                else {
                    cy.get('.question-option').contains(option.value).click()
                }
            })
        })
})

Cypress.Commands.add('answerQuestions', (questions) => {
    questions.forEach((options, index) => cy.answerQuestion(index, options))
})

/**
 * Questions - an array of array of answers
 * [
 *   { type: 'radio', answers: [ {value: 'FIND', correct: false} ] }
 * ]
 */
Cypress.Commands.add('submitQuiz', (questions) => {
    // Set Answer
    cy.answerQuestions(questions)

    // Submit
    cy.get('.btn-submit').click()
})


Cypress.Commands.add('submitVerify', () => {
    cy.get('.btn-verify').click()
})



Cypress.Commands.add('verifyQuestions', (questions) => {
    cy.get('.question')
        .each(($el, index) => {
            if ( !questions[index] ) {
                return
            }

            const className = questions[index] === true ? 'question--correct' : 'question--incorrect'

            cy.wrap($el).should('have.class', className)
        })

    if ( !questions.every(correct => correct === true) ) {
        cy.get('.btn-submit').should('contain', 'Try again')
        cy.get('.lesson-outcome--failed').should('exist')
    }
})

Cypress.Commands.add('verifyLessonPassed', (summary) => {
    cy.get('.lesson-outcome--failed').should('not.exist')
    cy.get('.module-outcome').should('be.visible')

    cy.get('.section.summary').should(summary ? 'be.visible' : 'be.hidden')
})

Cypress.Commands.add('verifyLessonFailed', () => {
    cy.get('.lesson-outcome--failed').should('exist')
})

Cypress.Commands.add('advanceFromModuleOutcome', () => {
    cy.get('.module-outcome-actions .btn').last().click()
})


const SubmitQueryButton = '[data-testid="editor-Run"]'
const EditorTextField = '[data-testid="activeEditor"] textarea'
const VisibleEditor = '#monaco-main-editor'

Cypress.Commands.add('executeCommand', (query, options = {}) => {
    cy.get(VisibleEditor).click()
    cy.get(EditorTextField).type(query, { force: true, ...options })
    cy.wait(100)
    cy.get(SubmitQueryButton).click()
    cy.wait(1000)
})


Cypress.Commands.add('foo', () => {})

/**
 * Answers - an array of array of answers
 * [
 *   [ 'Answer 1', 'Answer 2' ]  // <-- Question 1 (index 0)
 *   [ 'Answer 2', 'Answer 3' ]  // <-- Question 1 (index 0)
 * ]
 */
// Cypress.Commands.add('submitIncorrectAnswers', (answers) => {
//     // Select answers
//     Cypress.answerQuestion(answers)

//     // Click submit
//     cy.get('.btn-submit').click()
//     //     .should('contain', 'Checking')
//     //     .should('be.disabled')

//     // cy.wait(1000)

//     // Wait for response
//     cy.get('.btn-submit')
//         .should('contain', 'Try again')



//     // Check UI has updated with incorrect markers
//     answers.map((options, index) => {
//         cy.get('.question').eq(index)
//             .within(() => {
//                 options.forEach(option => {
//                     cy.get('.question-option').contains(option).parent('.question-option').should('have.class', 'question-option--incorrect')
//                 })
//             })
//     })
// })

// Cypress.Commands.add('submitCorrectAnswers', (answers) => {
//     answers.map((options, index) => {
//         cy.answerQuestion(index, options)
//     })

//     cy.get('.btn-submit').click()

//     answers.map((options, index) => {
//         cy.get('.question').eq(index)
//             .within(() => {
//                 options.forEach(option => {
//                     cy.get('.question-option').contains(option).parent('.question-option').should('have.class', 'question-option--correct')
//                 })
//             })
//     })

// })