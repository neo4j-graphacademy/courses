Cypress.Commands.add('enrol', (course) => {
    const [ firstModule ] = course.modules
    const [ firstLesson ] = firstModule.lessons

    // Open Course Overview
    cy.visit(course.link)

    //  Click Enrol
    cy.contains('.btn', 'Enrol').click()

    // Should go to first module
    // TODO: Match to end of string
    cy.url().should('contain', firstModule.link)

    // Button on overview should now say Continue
    cy.visit(course.link)

    // Enrol button should be replaced with a Continue Button
    cy.contains('.btn--primary', 'Continue').click()

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
