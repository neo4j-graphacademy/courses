describe('Importing CSV Data into Neo4j', () => {
    it('should pass importing-cypher', () => {
        cy.setup()
        cy.login()

        cy.getCourseDetails('importing-cypher')
            .then(([course]) => {
                cy.log(course)
                cy.enrol(course)
                cy.complete(course)
            })
    })
})
