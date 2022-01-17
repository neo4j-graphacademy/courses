import axios from "axios"
import { createElement } from "./modules/dom"

function logToggle(type, visible) {
    axios.post(`/account/event/${type}`, {
        // @ts-ignore
        courseName: window.course.title,
        // @ts-ignore
        courseSlug: window.course.slug,
        pageName: document.title,
        visible,
    })
}

function toggleSandbox() {
    const SELECTOR = 'classroom-sandbox'
    const TOGGLE = `${SELECTOR}-toggle`
    const VISIBLE = `${SELECTOR}--visible`

    Array.from(document.querySelectorAll(`.${TOGGLE}`))
        .forEach(button => {
            button.addEventListener('click', e => {
                e.preventDefault()
                const parent = document.querySelector(`.${SELECTOR}`)!
                parent.classList.toggle(VISIBLE)

                logToggle('toggle-sandbox', parent.classList.contains(VISIBLE))
            })
        })
}

function toggleSupport() {
    const SELECTOR = 'classroom-support'
    const TOGGLE = `${SELECTOR}-toggle`
    const VISIBLE = `${SELECTOR}--visible`

    Array.from(document.querySelectorAll(`.${TOGGLE}`))
        .forEach(button => {
            button.addEventListener('click', e => {
                e.preventDefault()
                const parent = document.querySelector(`.${SELECTOR}`)!
                parent.classList.toggle(VISIBLE)

                logToggle('toggle-sandbox', parent.classList.contains(VISIBLE))
            })

        })

    document.querySelectorAll('.classroom-panel-close')
        .forEach(element => {
            element.addEventListener('click', e => {
                e.preventDefault()

                element.parentElement?.parentElement?.classList.remove(VISIBLE)

                logToggle('toggle-sandbox', false)
            })
        })
}

function toggleToc() {
    const body = document.querySelector('body')

    if (!body) {
        return;
    }

    const HIDDEN = 'toc-hidden'
    Array.from(document.querySelectorAll('.toc-toggle'))
        .forEach(button => {
            button.addEventListener('click', e => {
                e.preventDefault()

                body.classList.toggle(HIDDEN)


            })
        })
}

function videoTabs() {
    const TAB_TARGET = 'tab-target'
    const TAB_TARGET_VISIBLE = 'tab-target--visible'

    const TAB = 'tab'
    const TAB_SELECTED = 'tab--selected'


    const video: HTMLDivElement | null = document.querySelector('.video')
    const transcript: HTMLDivElement | null = document.querySelector('.transcript')
    const doc: HTMLDivElement | null = document.querySelector('.doc')

    if (video && transcript && doc) {
        video.setAttribute('id', 'video')
        video.classList.add(TAB_TARGET)
        video.classList.add(TAB_TARGET_VISIBLE)

        transcript.setAttribute('id', 'transcript')
        transcript.classList.add(TAB_TARGET)


        const videoTab = createElement('a', `${TAB} ${TAB_SELECTED}`, ['Video'])
        videoTab.setAttribute('href', '#video')

        const transcriptTab = createElement('a', TAB, ['Transcript'])
        transcriptTab.setAttribute('href', '#transcript')

        const tabs = createElement('nav', 'tabs', [
            videoTab,
            transcriptTab,
        ])


        doc.prepend(tabs)

        // Tab Clicks
        document.querySelectorAll('.tab').forEach(element => {
            element.addEventListener('click', e => {
                e.preventDefault()

                const tabElements = document.querySelectorAll(`.${TAB}`)
                const tabTargets = document.querySelectorAll(`.${TAB_TARGET}`)

                const link: HTMLAnchorElement = e.target as HTMLAnchorElement
                const id = link.getAttribute('href')!.replace('#', '')

                // Remove active tab states
                tabElements.forEach(element => element.classList.remove(TAB_SELECTED))

                // Add active state to clicked tab
                link.classList.add(TAB_SELECTED)

                // Tab targets
                tabTargets.forEach(target => {
                    if (target.getAttribute('id') === id) {
                        target.classList.add(TAB_TARGET_VISIBLE)
                    }
                    else {
                        target.classList.remove(TAB_TARGET_VISIBLE)
                    }
                })
            })
        })
    }
}

function scrollIntoView(element: HTMLLIElement | HTMLHeadingElement) {
    const toc = document.querySelector('.toc')
    const header = document.querySelector('.header')

    if ( toc && header ) {
        setTimeout(() => {
            const { y } = element.getBoundingClientRect()
            toc.scrollTo(0, y)
        }, 100)
    }
}

function moveCurrentLessonIntoView() {
    const lesson: HTMLLIElement | null = document.querySelector('.toc-module-lesson--current')

    if ( lesson ) {
        return scrollIntoView(lesson!)
    }

    const module: HTMLHeadingElement | null = document.querySelector('.toc-module--current')

    if ( module ) {
        return scrollIntoView(module!)
    }
}


export default function classroom() {
    const body = document.querySelector('body')

    if (!body?.classList.contains('layout--classroom')) {
        return;
    }

    toggleSupport()
    toggleSandbox()
    toggleToc()
    videoTabs()
    // moveCurrentLessonIntoView()
}