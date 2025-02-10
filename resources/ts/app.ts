import lazyload from 'lazyload/lazyload.min.js'

import account from './account'
import classroom from './classroom'
import codeBlocks from './code-blocks'
import copyButtons from './copy-button'
import courseList from './course-list'
import courseOverview from './course-overview'
import embedVideos from './embed-videos'
import feedback from './feedback'
import header from './header'
import highlight from './highlight'
import home from './home'
import images from './images'
import questions from './questions'
import quiz from './quiz'
import redeem from './redeem'
import tabs from './tabs'
import contextMenu from './context-menu'
import accordion from './accordion'
import chatbot from './chatbot'
import exam from './exam'
import teamCourses from './team-courses'

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
    chatbot()
    embedVideos()
    tabs()
    feedback()
    images()
    courseOverview()
    quiz()
    redeem()
    contextMenu()
    accordion()
    exam()
    teamCourses()

    // Lazyload images
    const ll = new lazyload()
})
