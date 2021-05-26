import codeBlocks from './code-blocks'
import highlight from './highlight'
import questions from './questions'
import toggleSandbox from './toggle-sandbox'

window.addEventListener('DOMContentLoaded', () => {
    highlight()
    questions()
    toggleSandbox()
    codeBlocks()
})