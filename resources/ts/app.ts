import account from './account'
import classroom from './classroom'
import codeBlocks from './code-blocks'
import copyButtons from './copy-button'
import courseList from './course-list'
import header from './header'
import highlight from './highlight'
import home from './home'
import questions from './questions'

window.addEventListener('DOMContentLoaded', () => {
    highlight()
    questions()
    codeBlocks()
    copyButtons()
    header()

    home()
    courseList()
    account()
    classroom()
})