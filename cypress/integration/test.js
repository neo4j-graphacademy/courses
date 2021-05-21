describe('Test', () => {


    it('should log in', () => {
        cy.clearCookies()
        cy.clearLocalStorage()

        cy.visit('http://localhost:3000/')
        cy.wait(1000)

        cy.get('.navbar-login')
            .click()


        cy.get('input[type="email"]')
            .type("adam+graphacademy@neo4j.com")

        cy.get('input[type="password"]')
            .type("GraphsAreEverywhere2021")

        cy.get('.auth0-lock-submit')
            .click()

        cy.get('.navbar-account')
            .contains('Hello')

    })
})