

export default function images() {
    const MODAL_VISIBLE = 'modal--visible'

    document.querySelectorAll('.modal').forEach(modal => {
        modal.querySelectorAll('.modal-close, .modal-shade')
            .forEach(element => {
                element.addEventListener('click', e => {
                    e.preventDefault()
                    modal.classList.remove(MODAL_VISIBLE)
                })
            })
    })

    document.querySelectorAll('.imageblock img')
        .forEach(image => {
            image.addEventListener('click', e => {
                e.preventDefault()

                const cloned = image.cloneNode()
                const alt = image.getAttribute('alt')

                const modalElement = document.querySelector('.modal')
                const titleElement = document.querySelector('.modal-title')
                const bodyElement = document.querySelector('.modal-body')

                if (titleElement) {
                    if (typeof alt === 'string') {
                        titleElement.innerHTML = alt || ''
                        titleElement.classList.remove('hidden')
                    }
                    else {
                        titleElement.classList.add('hidden')
                    }
                }

                if (bodyElement && modalElement) {
                    // Clear out body
                    while (bodyElement.hasChildNodes()) {
                        bodyElement.removeChild(bodyElement.childNodes[0])
                    }

                    // Add in cloned element
                    bodyElement.appendChild(cloned)

                    // Make visible
                    modalElement.classList.add(MODAL_VISIBLE)
                }
            })
        })
}
