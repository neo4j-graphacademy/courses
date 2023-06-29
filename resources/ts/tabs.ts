import { createElement } from './modules/dom'

const TAB_TARGET = 'tab-target'
const TAB_TARGET_VISIBLE = 'tab-target--visible'

const TAB = 'tab'
const TAB_SELECTED = 'tab--selected'

const ATTRIBUTE_TARGET = 'data-target'
const ATTRIBUTE_TITLE = 'data-target'

function setTabSelectedInTabSet(activeElement: HTMLAnchorElement) {
    const tabElements = activeElement.parentNode!

    // Set all tabs to inactive
    tabElements.querySelectorAll(`.tab-element`).forEach(tabElement => tabElement.classList.remove(TAB_SELECTED))

    // Set this tab as active
    activeElement.classList.add(TAB_SELECTED)
}

function findTargets(activeElement: HTMLAnchorElement) {
    const href = activeElement.getAttribute('href')
    const target = activeElement.getAttribute(ATTRIBUTE_TARGET)


    if (href && href.startsWith('#')) {
        const targetElement = document.getElementById(href.replace('#', ''))

        if (targetElement) {
            setTargetVisibleInTabSet(targetElement as HTMLDivElement)
        }
    }

    if (target) {
        document.querySelectorAll(`a.tab-element[${ATTRIBUTE_TARGET}="${target}"]`)
            .forEach(targetTab => setTabSelectedInTabSet(targetTab as HTMLAnchorElement))

        document.querySelectorAll(`.tab-target[${ATTRIBUTE_TITLE}="${target}"]`)
            .forEach(targetElement => setTargetVisibleInTabSet(targetElement as HTMLDivElement))
    }
}

function setTargetVisibleInTabSet(target: HTMLDivElement) {
    const parent = target.parentElement!

    // Hide everything within the tab set
    parent.querySelectorAll(`.${TAB_TARGET}`).forEach(element => element.classList.remove(TAB_TARGET_VISIBLE))

    // Set this tab target to be active
    target.classList.add(TAB_TARGET_VISIBLE)
}

function handleGenericTabs() {
    document.querySelectorAll(`.${TAB}s`)
        .forEach(element => {
            element.querySelectorAll('.tab-element').forEach(tabElement => {
                tabElement.addEventListener('click', e => {
                    if (!tabElement.hasAttribute('data-target')) {
                        return
                    }
                    e.preventDefault()

                    const link: HTMLAnchorElement = e.target as HTMLAnchorElement

                    // Set tab to active within its group of tabs
                    setTabSelectedInTabSet(link)

                    // Hide all visible tab elements
                    document.querySelectorAll(`.${TAB_TARGET_VISIBLE}`).forEach(otherTabElement => otherTabElement.classList.remove(TAB_TARGET_VISIBLE))

                    // Set target to active within
                    findTargets(link)
                })
            })
        })
}

function convertClassroomTabs() {
    const classroom = document.querySelector('.classroom-content')

    if (!classroom) {
        return
    }

    classroom.querySelectorAll('.tab-element')
        .forEach((tabElement: Element) => {
            const href = tabElement.getAttribute('href')

            if (href) {
                tabElement.setAttribute('data-target', href.replace('#', ''))
            }
        })
}

export default function tabs() {
    convertClassroomTabs()
    handleGenericTabs()
}