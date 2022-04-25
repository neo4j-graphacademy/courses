const neo4j = require('neo4j-driver')

describe('End to End Course', () => {
    let courses

    before(done => {
        // Get Course Details
        const driver = neo4j.driver(
            Cypress.env('neo4j_uri'),
            neo4j.auth.basic(
                Cypress.env('neo4j_username'),
                Cypress.env('neo4j_password')
            )
        )

        driver.session().run(`
            MATCH (c:Course {status: "active"})
            RETURN c {
                .slug,
                .title,
                .link,
                modules: apoc.coll.sortMaps([ (c)-[:HAS_MODULE]->(m) | m {
                    .slug,
                    .title,
                    .link,
                    .order,
                    next: [ (m)-[:NEXT]->(n) | n.link ][0],
                    lessons: apoc.coll.sortMaps([ (m)-[:HAS_LESSON]->(l) | l {
                        .slug,
                        .title,
                        .link,
                        .order,
                        .sandbox,
                        next: [ (l)-[:NEXT]->(n) | n.link ][0],
                        questions: apoc.coll.sortMaps([ (l)-[:HAS_QUESTION]->(q) | q {
                            .id,
                            .order,
                            .slug,
                            .text,
                            .type,
                            .answers
                        }], '^slug')
                    } ], '^order')
                }], '^order')
            }
        `)
            .then(res => courses = res.records.map(record => record.toObject().c))
            .then(() => driver.close())
            .then(() => done())
    })


    it('should enrol in a course', () => {
        // Setup & Login
        cy.setup()
        cy.login()

        const qa = [
            'neo4j-fundamentals',
            'cypher-fundamentals',
            'modeling-fundamentals',
        ]
        for (const course of courses.filter(course => qa.includes(course.slug))) {
            cy.enrol(course)
        }
    })
})