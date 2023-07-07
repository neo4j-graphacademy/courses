describe('Cypher Fundamentals', () => {
    it('should pass cypher-fundamentals', () => {
        cy.setup()
        cy.login()

        cy.getCourseDetails('cypher-fundamentals')
            .then(([course]) => {
                cy.log(course)
                cy.enrol(course)
                cy.complete(course)
            })
    })
})
