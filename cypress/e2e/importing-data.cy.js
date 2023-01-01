describe('Importing CSV Data', () => {
    it('should pass importing-data', () => {
        cy.setup()
        cy.login()

        cy.getCourseDetails('importing-data')
            .then(([course]) => {
                cy.log(course)
                cy.enrol(course)
            })
    })
})
