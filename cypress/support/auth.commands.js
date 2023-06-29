Cypress.Commands.add('setup', () => {
    cy.visit(Cypress.env('setup_url') + '?email=' + encodeURIComponent(Cypress.env('user_email')))
})

Cypress.Commands.add('login', () => {
    cy.intercept({ method: 'POST', url: '/callback' }).as('callback')
    cy.intercept({ method: 'POST', url: '/courses/*/*/*' }).as('answer')
    cy.intercept({ method: 'POST', url: '/courses/*/*/*/verify' }).as('verify')

    cy.get('.navbar-login')
        .click()

    // Wait for Auth0 animation
    cy.wait(3000)

    // If previously logged in, you may see a
    if (cy.get('.auth0-lock-alternative-link').length) {
        cy.get('.auth0-lock-alternative-link').click()
    }

    // Log in to Auth0
    cy.get('input[name="email"]').type(Cypress.env('user_email'))
    cy.get('input[name="password"]').type(Cypress.env('user_password'))
    cy.get('button[name="submit"]').click()

    // Hack: Intercept and set cookie
    cy.wait('@callback').should(({ response }) => {
        const cookie = response.headers['set-cookie'].find(cookie => cookie.startsWith('appSession'));

        const [name, payload] = cookie.split('=')
        const [value] = payload.split(';')

        cy.setCookie(name, value)

        cy.reload()
    })

    // The user should now be logged in
    cy.get('.navbar-account').should('be.visible')
})

Cypress.Commands.add('logout', () => {
    cy.visit('/logout')
})
