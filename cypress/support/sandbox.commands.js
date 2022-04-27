const SubmitQueryButton = '[data-testid="editor-Run"]'
// const EditorTextField = '[data-testid="activeEditor"] textarea'
const EditorTextField = '.monaco-editor textarea'
const VisibleEditor = '#monaco-main-editor'

const getSandboxIframe = () => {
    return cy.get('iframe.sandbox')
        .its('0.contentDocument').should('exist')
}

const getSandboxBody = () => {
    return getSandboxIframe()
        .its('body').should('not.be.undefined')
        .then(cy.wrap)
}

Cypress.Commands.add('executeCypher', (query, options = {}) => {
    const cleaned = query.replace(/{/g, '{{}')
        .replace(/\n/g, ' ')

    getSandboxBody().find(VisibleEditor, {timeout: 10000}).click()
    getSandboxBody().find(EditorTextField).clear().type(cleaned, { force: true, ...options })
    cy.wait(100)
    getSandboxBody().find(SubmitQueryButton).click()
    cy.wait(1000)
})
