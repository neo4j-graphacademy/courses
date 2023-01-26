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

                logToggle('support-toggle', parent.classList.contains(VISIBLE))
            })

        })

    document.querySelectorAll('.classroom-panel-close')
        .forEach(element => {
            element.addEventListener('click', e => {
                e.preventDefault()

                element.parentElement?.parentElement?.classList.remove(VISIBLE)

                logToggle('support-toggle', false)
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