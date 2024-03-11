import { copyToClipboard } from "./modules/clipboard"

export default function account() {
    // Copy link
    document.querySelectorAll('.share-form-action--copy').forEach(el => {
        el.addEventListener('click', e => {
            e.preventDefault()

            const label = el.querySelector('.share-form-action-label')
            const value = el.getAttribute('href')

            if (value) {
                copyToClipboard(value)
            }

            if (label) {
                const originalHtml = label.innerHTML
                label.innerHTML = 'Copied!'

                const cto = setTimeout(() => {
                    label.innerHTML = originalHtml
                    clearTimeout(cto)
                }, 1000)
            }
        })
    })

    // Enable submit button on change
    document.querySelectorAll('form').forEach(form => {
        const submit = form.querySelectorAll('button')

        form.querySelectorAll('input, select, textarea').forEach(
            el => {
                el.addEventListener('change', () => {
                    submit.forEach(el => el.removeAttribute('disabled'))
                })
                el.addEventListener('keyup', () => {
                    submit.forEach(el => el.removeAttribute('disabled'))
                })

            })
    })

    // Join team form
    document.querySelectorAll('.team-join-form')
        .forEach(form => {
            form.addEventListener('submit', e => {
                const button = form.querySelector('button')
                if (button) {
                    button.innerHTML = 'Joining...'
                    button.classList.add('btn--loading')
                    button.classList.add('btn--disabled')
                    button.setAttribute('disabled', 'disabled')
                }
            })
        })
}
