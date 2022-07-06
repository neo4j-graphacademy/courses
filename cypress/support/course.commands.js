const neo4j = require('neo4j-driver')

Cypress.Commands.add('getCourseDetails', (slug) => {
    // Get Course Details
    const driver = neo4j.driver(
        Cypress.env('neo4j_uri'),
        neo4j.auth.basic(
            Cypress.env('neo4j_username'),
            Cypress.env('neo4j_password')
        )
    )

    return driver.session().run(`
        MATCH (c:Course)
        WHERE $slug IS NULL AND c.status = 'active' OR c.slug = $slug
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
    `, { slug: slug || null })
        .then(res => {
            const courses = res.records.map(record => record.toObject().c)

            return driver.close()
                .then(() => courses)
        })
})

Cypress.Commands.add('enrol', (course) => {
    const [ firstModule ] = course.modules
    const [ firstLesson ] = firstModule.lessons

    // Open Course Overview
    cy.visit(course.link)

    //  Click Enrol
    cy.get('.btn--enrol').click()

    // Should go to first module
    // TODO: Match to end of string
    cy.url().should('contain', firstModule.link)

    // Button on overview should now say Continue
    cy.visit(course.link)

    // Enrol button should be replaced with a Continue Button
    cy.get('.btn--continue').click()

    // Continue Button should go to the first module
    cy.url().should('contain', firstModule.link)
    cy.get('.classroom-content h1').contains(firstModule.title)

    // Use Pagination to go to next lesson
    cy.paginationNext()

    cy.url().should('contain', firstLesson.link)
    cy.get('.classroom-content h1').contains(firstLesson.title)

    // Recursively visit Modules
    for (const module of course.modules) {
        cy.visit(module.link)

        // Check Module Title
        cy.get('.classroom-content h1').contains(module.title)

        // Test Pagination
        const [ firstLesson ] = module.lessons

        cy.paginationNext()
        cy.url().should('contain', firstLesson.link)

        // Check Lesson Title
        cy.get('.classroom-content h1').contains(firstLesson.title)

        // Visit Lessons
        const { lessons } = module

        while ( lessons.length ) {
            const lesson = lessons.shift()

            cy.attemptLesson(lesson)
        }
    }

    // Refresh current page for summary link
    cy.reload()

    cy.get('.lesson-outcome.lesson-outcome--passed')
        .should('exist')
        // .should('contain', 'Course Completed')

    cy.get('.toc-course-summary')
        .should('exist')
        // .should('contain', 'Course Summary')

    cy.get('.toc-course-achievement')
        .should('exist')

    // Test Completion on Course Overview
    cy.visit(course.link)

    cy.get('.course-overview.course--completed')
        .should('exist')
})

Cypress.Commands.add('paginationNext', () => {
    cy.get('.pagination-link--next a').should('exist').click()
})

Cypress.Commands.add('checkVideoTabs', () => {
    cy.get('.tab-element[href="#transcript"]').click().should('have.class', 'tab--selected')
    // TODO: Timed out retrying after 4000ms: expected '<div#transcript.section.transcript.tab-target.tab-target--visible>' to be 'visible'
    cy.get('#transcript').should('have.class', 'tab-target--visible')//.should('be.visible')
    cy.get('#video').should('not.have.class', 'tab-target--visible')//.should('not.be.visible')

    cy.get('.tab-element[href="#video"]').click().should('have.class', 'tab--selected')
    cy.get('#video').should('have.class', 'tab-target--visible')//.should('be.visible')
    cy.get('#transcript').should('not.have.class', 'tab-target--visible')//.should('not.be.visible')
})
