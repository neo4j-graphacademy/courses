describe('Test Links', () => {

    it('should check links on home page', () => {
        cy.visit('/')

        cy.checkLinks()
    })

    it('should check links on category page', () => {
        cy.visit('/categories/beginners')

        cy.checkLinks()

        cy.get('.course .course-title a').each($el => {
            $el.click()
            cy.checkLinks()
        })
    })
})