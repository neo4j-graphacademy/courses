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

Cypress.Commands.add('verifyLessonPassed', (reload = true) => {
    cy.get('.lesson-outcome--passed').should('exist')
    cy.get('.lesson-outcome--passed a').should('exist')

    if ( reload ) {
        cy.reload()

        cy.get('body').should('have.class', 'lesson--completed')
        cy.get('.lesson-outcome--passed').should('exist')
        cy.get('.lesson-outcome--passed a').should('exist')
        cy.get('.toc-module-lesson--current').should('have.class', 'toc-module-lesson--completed')
    }
})

Cypress.Commands.add('verifyLessonFailed', () => {
    cy.get('.lesson-outcome--failed').should('exist')
    cy.get('.question').should('have.class', 'question--incorrect')
})

Cypress.Commands.add('nextLesson', () => {
    cy.get('.lesson-outcome--passed').should('exist')
    cy.get('.lesson-outcome--passed a.lesson-outcome-progress').should('exist').click()
})

Cypress.Commands.add('markAsRead', () => {
    cy.get('input[name="read"]').click()

    // Should have a continue link
    cy.get('.lesson-outcome--passed').should('exist')
    cy.get('.lesson-outcome--passed a.lesson-outcome-progress').should('exist')
})

Cypress.Commands.add('next', () => {
    cy.get('.pagination-link--next a').click()
})