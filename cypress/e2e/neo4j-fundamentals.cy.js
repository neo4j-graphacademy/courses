describe('Neo4j Fundamentals', () => {
    it('should pass neo4j-fundamentals', () => {
        cy.setup()
        cy.login()

        cy.getCourseDetails('neo4j-fundamentals')
            .then(([course]) => {
                cy.log(course)
                cy.enrol(course)
            })
    })
})
