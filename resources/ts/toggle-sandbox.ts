window.addEventListener('DOMContentLoaded', () => {
    const VISIBLE = 'lesson-sandbox--visible'
    Array.from(document.querySelectorAll('.lesson-sandbox-toggle'))
        .forEach(button => {
            button.addEventListener('click', e => {
                e.preventDefault()
                const parent = button.parentElement!
                parent.classList.toggle(VISIBLE)
            })
        })
})