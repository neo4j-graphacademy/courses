export default function redeem() {
    const form = document.getElementById('redeem-form')

    if (!form) {
        return;
    }

    const submit = document.getElementById('submit')

    const preview = document.getElementById('preview')
    const selector = document.getElementById('selector')
    const country = document.getElementById('country')
    const stateContainer = document.getElementById('state-container')
    const state = document.getElementById('state')

    const taxContainer = document.getElementById('tax-container')
    const tax = document.getElementById('tax_number')

    const setRequiredFields = () => {
        const checked = country?.querySelector('option:checked')
        const value = checked?.getAttribute('value')

        // @ts-ignore
        const info = window.countries.find(row => row.code === value)

        // Populate state form?
        if (info.states !== null) {
            const blank = document.createElement('option')
            state?.appendChild(blank)

            info.states.forEach(row => {
                const option = document.createElement('option')
                option.setAttribute('value', row.code)
                option.innerHTML = row.name
                state?.appendChild(option)
            })

            state?.setAttribute('required', 'required')
            stateContainer?.classList.add('visible')
        }
        else {
            state?.removeAttribute('required')
            state?.querySelectorAll('option').forEach(el => el.remove())
            stateContainer?.classList.remove('visible')
        }

        // Brazil requires a tax code
        if (value == 'BR') {
            taxContainer?.classList.add('visible')
            tax?.setAttribute('required', 'required')
        }
        else {
            taxContainer?.classList.remove('visible')
            tax?.removeAttribute('required')
        }
    }


    form?.addEventListener('submit', () => {
        submit?.classList.add('btn--loading')
        submit?.classList.add('btn--disabled')
        submit?.setAttribute('disabled', '')
    })

    selector?.addEventListener('change', (e) => {
        // @ts-ignore
        const selected = e.target?.querySelector('option:checked')
        const src = selected?.dataset.previewUrl

        if (src) {
            preview?.setAttribute('src', src)
        }
    })

    country?.addEventListener('change', e => {
        setRequiredFields()
    })

    // Initial State
    setRequiredFields()
}
