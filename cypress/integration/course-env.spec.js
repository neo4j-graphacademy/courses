describe('Test course from environment', () => {
    it('should pass the course with slug defined in cypress.env.json ', () => {
        cy.log('Testing course', Cypress.env('course'))

        cy.setup()
        cy.login()

        cy.getCourseDetails(Cypress.env('course'))
            .then(([course]) => {
                cy.log(course)
                cy.enrol(course)
            })
    })
})
