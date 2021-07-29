export default function tabs() {
    const TAB_TARGET = 'tab-target'
    const TAB_TARGET_VISIBLE = 'tab-target--visible'

    const TAB = 'tab'
    const TAB_SELECTED = 'tab--selected'

    document.querySelectorAll(`.${TAB}s`)
        .forEach(element => {
            element.querySelectorAll('.tab').forEach(element => {
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

        })

}