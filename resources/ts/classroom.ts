import { createElement } from "./modules/dom"

function toggleSandbox() {
    const VISIBLE = 'classroom-sandbox--visible'
    Array.from(document.querySelectorAll('.classroom-sandbox-toggle'))
        .forEach(button => {
            button.addEventListener('click', e => {
                e.preventDefault()
                const parent = button.parentElement!
                parent.classList.toggle(VISIBLE)
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


export default function classroom() {
    const body = document.querySelector('body')

    if (!body?.classList.contains('layout--classroom')) {
        return;
    }

    toggleSandbox()
    toggleToc()
    videoTabs()

}