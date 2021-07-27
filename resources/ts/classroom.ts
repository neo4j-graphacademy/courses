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


export default function classroom() {
    toggleSandbox()
    toggleToc()


}