export default function accordion() {
    document.querySelectorAll('.accordion-item')
        .forEach(el => {
            el.querySelector('.accordion-expand')
                ?.addEventListener('click', e => {
                    e.preventDefault()

                    el.classList.toggle('accordion-item--visible')
                })
        })
}