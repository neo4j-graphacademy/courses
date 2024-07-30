import { copyToClipboard } from "./modules/clipboard"

type InputTypes = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement


export default function account() {
    // Account form switch optin
    const country = document.getElementById('country') as HTMLSelectElement
    const soft_optin = document.getElementById('soft')
    const required_optin = document.getElementById('required')

    if (country && soft_optin && required_optin) {
        const displayOptIn = () => {
            const selected = country.querySelector(`option[value="${country.value}"]`)
            const optin = selected?.getAttribute('data-optin')

            if (optin === 'required') {
                soft_optin.style.display = 'none'
                required_optin.style.display = 'block'
            }
            else if (optin === 'soft') {
                soft_optin.style.display = 'block'
                required_optin.style.display = 'none'
            }
            else {
                soft_optin.style.display = 'none'
                required_optin.style.display = 'none'
            }
        }

        country.addEventListener('change', (e) => {
            e.preventDefault()
            displayOptIn()
        })

        displayOptIn()
    }

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
