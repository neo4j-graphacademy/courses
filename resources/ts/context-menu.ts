export default function contextMenu() {
    const CONTEXT_MENU_ACTIVE = 'context-menu-container--active'

    document.querySelectorAll('.context-menu-container')
        .forEach(container => {
            container.querySelector('.context-menu-icon')?.addEventListener(
                'click',
                e => {
                    e.preventDefault()
                    const visible = container.classList.contains(CONTEXT_MENU_ACTIVE)

                    document.querySelectorAll(`.${CONTEXT_MENU_ACTIVE}`)
                        .forEach(el => el.classList.remove(CONTEXT_MENU_ACTIVE))

                    if (!visible) {
                        container.classList.add(CONTEXT_MENU_ACTIVE)
                    }
                })
        })

    document.querySelectorAll('.context-menu-item--danger')
        .forEach(el => el.addEventListener('click', e => {
            if (!confirm('Are you sure you would like to do this?  This action cannot be undone')) {
                e.preventDefault()
                return false
            }
        }))
}