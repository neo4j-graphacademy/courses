import { copyToClipboard } from "./modules/clipboard"

type InputTypes = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement


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
        const elements = form.querySelectorAll<InputTypes>('input, select, textarea')


        const required = Array.from<InputTypes>(elements)
            .filter((element: InputTypes) => element.hasAttribute('required'))

        const enableSubmit = () => {
            const completed = required.every(
                (el: InputTypes) => el.value.length >= 2
            )
            if (completed) {
                submit.forEach(el => el.removeAttribute('disabled'))
            } else {
                submit.forEach(el => el.setAttribute('disabled', 'disabled'))
            }
        }

        form.querySelectorAll('input, select, textarea').forEach(
            el => {

                el.addEventListener('change', enableSubmit)
                el.addEventListener('keyup', enableSubmit)

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
