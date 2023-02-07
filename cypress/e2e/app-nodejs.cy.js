describe('Building Neo4j Applications with Node.js', () => {
    it('should pass app-nodejs', () => {
        cy.setup()
        cy.login()

        cy.getCourseDetails('app-nodejs')
            .then(([course]) => {
                cy.log(course)
                cy.enrol(course)
            })
    })
})
