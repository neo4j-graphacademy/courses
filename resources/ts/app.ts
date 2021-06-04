import codeBlocks from './code-blocks'
import copyButtons from './copy-button'
import highlight from './highlight'
import home from './home'
import questions from './questions'
import toggleSandbox from './toggle-sandbox'

window.addEventListener('DOMContentLoaded', () => {
    highlight()
    questions()
    toggleSandbox()
    codeBlocks()
    copyButtons()

    home()
})