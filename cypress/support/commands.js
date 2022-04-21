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


Cypress.Commands.add('setup', () => {
    cy.visit(Cypress.env('setup_url') +'?email='+ encodeURIComponent(Cypress.env('user_email')))
})

Cypress.Commands.add('login', () => {
    cy.intercept({ method: 'POST', url: '/callback' }).as('callback')
        cy.intercept({ method: 'POST', url: '/courses/*/*/*' }).as('answer')
        cy.intercept({ method: 'POST', url: '/courses/*/*/*/verify' }).as('verify')

        cy.get('.navbar-login')
            .click()

        // Log in to Auth0
        cy.get('#username').type(Cypress.env('user_email'))
        cy.get('#password').type(Cypress.env('user_password'))
        cy.get('button').contains('Login').click()

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
})

Cypress.Commands.add('logout', () => {
    cy.visit('/logout')
})
