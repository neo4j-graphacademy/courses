describe('Authentication', () => {
    it('should handle already authenticated', () => {
        cy.logout()
        cy.login()
        cy.logout()
    })
})