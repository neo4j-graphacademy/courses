describe('Introduction to Neo4j & GraphQL', () => {
    it('should pass graphql-basics', () => {
        cy.setup()
        cy.login()

        cy.getCourseDetails('graphql-basics')
            .then(([course]) => {
                cy.log(course)
                cy.enrol(course)
                cy.complete(course)
            })
    })
})
