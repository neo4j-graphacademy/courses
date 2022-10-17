import lazyload from 'lazyload/lazyload.min.js'

import account from './account'
import classroom from './classroom'
import codeBlocks from './code-blocks'
import copyButtons from './copy-button'
import courseList from './course-list'
import courseOverview from './course-overview'
import feedback from './feedback'
import header from './header'
import highlight from './highlight'
import home from './home'
import images from './images'
import questions from './questions'
import quiz from './quiz'
import tabs from './tabs'

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
    tabs()
    feedback()
    images()
    courseOverview()
    quiz()

    // Lazyload images
    const ll = new lazyload()
})
