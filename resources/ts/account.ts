import { copyToClipboard } from "./modules/clipboard"

export default function account() {
    // document.querySelectorAll('#delete .btn--danger').forEach(el => {
    //     el.addEventListener('click', e => {
    //         if (!confirm('Are you sure you want to delete your account?  This action cannot be undone!')) {
    //             e.preventDefault()
    //         }
    //     })
    // })

    // Copy link
    document.querySelectorAll('.account-copy').forEach(el => {
        el.addEventListener('click', e => {
            e.preventDefault()

            const label = el.querySelector('.account-action-label')
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
            el => el.addEventListener('change', () => {
                submit.forEach(el => el.removeAttribute('disabled'))
            })
        )
    })
}
