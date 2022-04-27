describe('End to End Course', () => {

    // TODO: Move to cypress.env.json
    const qa = [
        'neo4j-fundamentals',
        'cypher-fundamentals',
        'modeling-fundamentals',
    ]

    it('should enrol in a course', () => {
        // Setup & Login
        cy.setup()
        cy.login()

        cy.getCourseDetails()
            .then(courses => {
                for (const course of courses.filter(course => qa.includes(course.slug))) {
                    cy.enrol(course)
                }
            })
    })
})