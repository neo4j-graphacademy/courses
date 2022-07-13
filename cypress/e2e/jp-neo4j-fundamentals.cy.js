describe('🇯🇵 Neo4j Fundamentals', () => {
    // TODO: Does not pass due to japanese characters in IDs
    it('should pass jp-neo4j-fundamentals', () => {
        cy.setup()
        cy.login()

        cy.getCourseDetails('jp-neo4j-fundamentals')
            .then(([course]) => {
                cy.log(course)
                cy.enrol(course)
            })
    })
})
