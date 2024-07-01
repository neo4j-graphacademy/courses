import { createElement } from "./modules/dom"
import { logUiEvent } from "./modules/events"

export function logToggle(type, visible) {
    logUiEvent(type, {
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

                logToggle('sandbox-toggle', parent.classList.contains(VISIBLE))
            })
        })
}

function togglePanel(SELECTOR) {
    const TOGGLE = `${SELECTOR}-toggle`
    const EVENT = TOGGLE.replace('classroom-', '')
    const VISIBLE = `classroom-panel--visible`

    Array.from(document.querySelectorAll(`.${TOGGLE}`))
        .forEach(button => {
            button.addEventListener('click', e => {
                e.preventDefault()

                const parent = document.querySelector(`.${SELECTOR}`)!

                const visible = parent.classList.contains(VISIBLE)

                document.querySelectorAll(`.${VISIBLE}`)
                    .forEach(el => el.classList.remove(VISIBLE))

                if (!visible) {
                    parent.classList.add(VISIBLE)
                }

                logToggle(EVENT, parent.classList.contains(VISIBLE))
            })
        })

    document.querySelectorAll('.classroom-panel-close')
        .forEach(element => {
            element.addEventListener('click', e => {
                e.preventDefault()
                const parent = element.parentElement?.parentElement

                parent?.classList.remove(VISIBLE)

                if (parent?.classList.contains(SELECTOR)) {
                    logToggle(EVENT, false)
                }
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

    const TAB = 'tab-element'
    const TAB_SELECTED = 'tab--selected'

    const classroom: HTMLDivElement | null = document.querySelector('.classroom')
    const video: HTMLDivElement | null = document.querySelector('.video')
    const transcript: HTMLDivElement | null = document.querySelector('.transcript')
    const doc: HTMLDivElement | null = document.querySelector('.doc')

    const prefersTranscript = classroom?.classList.contains('classroom--prefer-transcript')

    if (video && transcript && doc) {
        // Set up targets
        video.setAttribute('id', 'video')
        video.classList.add(TAB_TARGET)

        transcript.setAttribute('id', 'transcript')
        transcript.classList.add(TAB_TARGET)

        // select which is visible
        if (prefersTranscript) {
            transcript.classList.add(TAB_TARGET_VISIBLE)
        }
        else {
            video.classList.add(TAB_TARGET_VISIBLE)
        }

        const videoTab = createElement('a', `${TAB} ${!prefersTranscript ? TAB_SELECTED : ''}`, ['Watch'])
        videoTab.setAttribute('href', '#video')
        videoTab.addEventListener('click', () => logUiEvent('show-video'))

        const transcriptTab = createElement('a', `${TAB} ${prefersTranscript ? TAB_SELECTED : ''}`, ['Read'])
        transcriptTab.setAttribute('href', '#transcript')
        transcriptTab.addEventListener('click', () => logUiEvent('show-transcript'))

        const tabs = createElement('nav', 'tabs', [
            videoTab,
            transcriptTab,
        ])

        doc.prepend(tabs)
    }
}

function scrollIntoView(element: HTMLLIElement | HTMLHeadingElement) {
    const toc = document.querySelector('.toc')
    const header = document.querySelector('.header')

    if (toc && header) {
        setTimeout(() => {
            const { y } = element.getBoundingClientRect()
            toc.scrollTo(0, y)
        }, 100)
    }
}

function moveCurrentLessonIntoView() {
    const lesson: HTMLLIElement | null = document.querySelector('.toc-module-lesson--current')

    if (lesson) {
        return scrollIntoView(lesson!)
    }

    const module: HTMLHeadingElement | null = document.querySelector('.toc-module--current')

    if (module) {
        return scrollIntoView(module!)
    }
}

function toggleNavigation() {
    const nav = document.querySelector('.classroom-navbar')
    const HIDDEN = 'classroom-navbar--hidden'
    const VISIBLE = 'classroom-navbar--visible'

    if (!nav) {
        return
    }

    document.querySelectorAll('.classroom-navbar-hide')
        .forEach(el => {
            el.addEventListener('click', () => {
                logUiEvent('hide-sidebar', {})

                nav.classList.remove(VISIBLE)
                nav.classList.add(HIDDEN)
            })
        })

    document.querySelectorAll('.classroom-navbar-show')
        .forEach(el => {
            el.addEventListener('click', () => {
                logUiEvent('show-sidebar', {})

                nav.classList.add(VISIBLE)
                nav.classList.remove(HIDDEN)
            })
        })
}


export default function classroom() {
    const body = document.querySelector('body')

    if (!body?.classList.contains('layout--classroom')) {
        return;
    }

    togglePanel('classroom-support')
    togglePanel('classroom-chatbot')
    toggleSandbox()
    toggleToc()
    videoTabs()
    toggleNavigation()
    // moveCurrentLessonIntoView()
}