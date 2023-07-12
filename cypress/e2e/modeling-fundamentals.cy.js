describe('Graph Data Modeling Fundamentals', () => {
    it('should pass modeling-fundamentals', () => {
        cy.setup()
        cy.login()

        cy.getCourseDetails('modeling-fundamentals')
            .then(([course]) => {
                cy.log(course)
                cy.enrol(course)
                cy.complete(course)
            })
    })
})
