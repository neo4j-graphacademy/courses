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


    if ( href && href.startsWith('#') ) {
        const targetElement = document.getElementById(href.replace('#', ''))

        if ( targetElement ) {
            setTargetVisibleInTabSet(targetElement as HTMLDivElement)
        }
    }

    if ( target ) {
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
                    e.preventDefault()

                    const link: HTMLAnchorElement = e.target as HTMLAnchorElement

                    // Set tab to active within its group of tabs
                    setTabSelectedInTabSet(link)

                    // Hide all visible tab elements
                    document.querySelectorAll(`.${TAB_TARGET_VISIBLE}`).forEach(element => element.classList.remove(TAB_TARGET_VISIBLE))

                    // Set target to active within
                    findTargets(link)
                })
            })

        })
}


let lastTabId = 0

function convertClassroomTabs() {
    const classroom = document.querySelector('.classroom-content')

    if ( !classroom ) {
        return
    }

    classroom.querySelectorAll('.tab')
        .forEach((tabElement: Element) => {
            // Only get the first tab in a list of siblings
            if ( tabElement.previousElementSibling && (tabElement.previousElementSibling as HTMLDivElement).classList.contains('tab') ) {
                return
            }

            // Add in placeholder
            const placeholder = createElement('div', 'tab-placeholder', [])
            tabElement.parentElement!.insertBefore(placeholder, tabElement)

            // Get Tab Targets
            const theseTabs: HTMLElement[] = []
            const targets: HTMLElement[] = [tabElement as HTMLElement]

            let nextSibling = (tabElement as HTMLElement).nextElementSibling

            while ( nextSibling && (nextSibling as HTMLElement).classList.contains('tab') ) {
                targets.push(nextSibling as HTMLElement)

                nextSibling = (nextSibling as HTMLElement).nextElementSibling
            }

            targets.forEach((target, index) => {
                // Generate tab ID
                lastTabId++

                // Assign tab id to the div
                const thisTabId = `tab__${lastTabId}`
                target.setAttribute('id', thisTabId)

                target.classList.add('tab-target')

                // Get the title and create a tab element
                const title = target.querySelector('.title')!.innerHTML.replace(/Example ([0-9]+)./, '').trim()

                target.setAttribute(ATTRIBUTE_TITLE, title)

                const tab = createElement('a', 'tab-element', [title])
                tab.setAttribute('href', `#${thisTabId}`)

                tab.setAttribute(ATTRIBUTE_TARGET, title)

                if ( index === 0 ) {
                    tab.classList.add('tab--selected')
                    target.classList.add('tab-target--visible')
                }

                theseTabs.push(tab)

                // Remove the target from the page
                target.parentElement!.removeChild(target)
            })

            // Create a div containing the tabs
            const tabElements = createElement('div', 'tabs', theseTabs)

            // Add the tabs and all targets to a new container
            const tabContainer = createElement('div', 'tab-container', [
                tabElements,
                ...targets
            ])

            placeholder.parentElement!.insertBefore(tabContainer, placeholder)
        })
}

export default function tabs() {
    convertClassroomTabs()
    handleGenericTabs()
}