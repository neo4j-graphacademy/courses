Cypress.Commands.add('checkMainLinks', () => {
    const ignore = [
        'tel:',
        '//neo4j.com',
    ]

    cy.get(".main a:not([href*='https:]']").each($el => {
        const href = $el.prop('href')
        const target = $el.prop('target')

        if (target === '' && href && href.length > 0) {
            if ( ignore.some(value => href.includes(value)) ) {
                return;
            }

            cy.request($el.prop('href'))
                .should((response) => {
                    expect(response.status).to.eq(200)
                })
        }
    })
})
