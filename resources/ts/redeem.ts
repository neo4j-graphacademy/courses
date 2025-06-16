export default function redeem() {
    const form = document.getElementById('redeem-form') as HTMLFormElement

    if (!form) {
        return;
    }

    const submit = document.getElementById('submit')
    const preview = document.getElementById('preview')
    const selector = document.getElementById('selector') as HTMLSelectElement
    const country = document.getElementById('country') as HTMLSelectElement
    const stateContainer = document.getElementById('state-container')
    const state = document.getElementById('state') as HTMLSelectElement
    const taxContainer = document.getElementById('tax-container')
    const tax = document.getElementById('tax_number') as HTMLInputElement

    // Define validation rule types
    type ValidationRule = {
        required: boolean;
        message: string;
        minLength?: number;
        maxLength?: number;
        pattern?: RegExp;
    }

    // Build validation rules from HTML attributes
    const buildValidationRules = (field: HTMLInputElement | HTMLSelectElement): ValidationRule => {
        const rule: ValidationRule = {
            required: field.hasAttribute('required'),
            message: field.getAttribute('data-error-message') || 'This field is required'
        }

        // Get minlength/maxlength
        if (field.hasAttribute('minlength')) {
            rule.minLength = parseInt(field.getAttribute('minlength') || '0')
        }
        if (field.hasAttribute('maxlength')) {
            rule.maxLength = parseInt(field.getAttribute('maxlength') || '0')
        }

        // Get pattern
        if (field.hasAttribute('pattern')) {
            const pattern = field.getAttribute('pattern')
            if (pattern) {
                rule.pattern = new RegExp(pattern)
            }
        }

        // Set default messages based on field type and attributes
        if (!field.getAttribute('data-error-message')) {
            if (field.type === 'email') {
                rule.message = 'Please enter a valid email address'
            } else if (field.type === 'tel') {
                rule.message = 'Please enter a valid phone number'
            } else if (field instanceof HTMLSelectElement) {
                rule.message = 'Please select an option'
            } else if (rule.pattern) {
                rule.message = 'Please enter a valid value'
            } else if (rule.minLength && rule.maxLength) {
                rule.message = `Please enter between ${rule.minLength} and ${rule.maxLength} characters`
            } else if (rule.minLength) {
                rule.message = `Please enter at least ${rule.minLength} characters`
            } else if (rule.maxLength) {
                rule.message = `Please enter no more than ${rule.maxLength} characters`
            }
        }

        return rule
    }

    // Track touched fields
    const touchedFields = new Set<string>()

    // Create error label if it doesn't exist
    const getOrCreateErrorLabel = (fieldId: string): HTMLLabelElement => {
        let errorLabel = document.querySelector(`label.label-error[for="${fieldId}"]`) as HTMLLabelElement
        if (!errorLabel) {
            errorLabel = document.createElement('label')
            errorLabel.className = 'label-error'
            errorLabel.setAttribute('for', fieldId)
            const field = document.getElementById(fieldId)
            field?.parentNode?.insertBefore(errorLabel, field.nextSibling)
        }
        return errorLabel
    }

    // Validate a single field
    const validateField = (field: HTMLInputElement | HTMLSelectElement): string | null => {
        const rules = buildValidationRules(field)
        const value = field.value.trim()

        if (rules.required && !value) {
            return rules.message
        }

        if (value) {
            if (rules.minLength && value.length < rules.minLength) {
                return rules.message
            }
            if (rules.maxLength && value.length > rules.maxLength) {
                return rules.message
            }
            if (rules.pattern && !rules.pattern.test(value)) {
                return rules.message
            }
        }

        return null
    }

    // Update field validation state
    const updateFieldValidation = (field: HTMLInputElement | HTMLSelectElement) => {
        const errorLabel = getOrCreateErrorLabel(field.id)
        const error = validateField(field)

        if (error && touchedFields.has(field.id)) {
            errorLabel.textContent = error
            errorLabel.style.display = 'block'
            field.classList.add('invalid')
        } else {
            errorLabel.textContent = ''
            errorLabel.style.display = 'none'
            field.classList.remove('invalid')
        }
    }

    // Validate entire form
    const validateForm = (): boolean => {
        let isValid = true
        const fields = form.querySelectorAll('input, select') as NodeListOf<HTMLInputElement | HTMLSelectElement>

        fields.forEach(field => {
            const error = validateField(field)
            if (error) {
                isValid = false
                updateFieldValidation(field)
            }
        })

        return isValid
    }

    // Add validation event listeners to all form fields
    const addValidationListeners = () => {
        const fields = form.querySelectorAll('input, select') as NodeListOf<HTMLInputElement | HTMLSelectElement>

        fields.forEach(field => {
            // Mark field as touched on blur
            field.addEventListener('blur', () => {
                touchedFields.add(field.id)
                updateFieldValidation(field)
            })

            // Update validation on keyup for input fields
            if (field instanceof HTMLInputElement) {
                field.addEventListener('keyup', () => {
                    if (touchedFields.has(field.id)) {
                        updateFieldValidation(field)
                    }
                })
            }

            // Update validation on change for select fields
            if (field instanceof HTMLSelectElement) {
                field.addEventListener('change', () => {
                    touchedFields.add(field.id)
                    updateFieldValidation(field)
                })
            }
        })

        // Add mousedown validation for submit button
        submit?.addEventListener('mousedown', () => {
            // Mark all fields as touched
            const fields = form.querySelectorAll('input, select') as NodeListOf<HTMLInputElement | HTMLSelectElement>
            fields.forEach(field => touchedFields.add(field.id))

            // Validate all fields
            validateForm()
        })
    }

    const setRequiredFields = () => {
        const checked = country?.querySelector('option:checked')
        const value = checked?.getAttribute('value')

        // @ts-ignore
        const info = window.countries.find(row => row.code === value)

        // Populate state form?
        if (info !== undefined && info?.states !== null) {
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

        // India requires a state
        if (value == 'IN') {
            const stateTextContainer = document.getElementById('state-text-container')
            const stateText = document.getElementById('state_text')

            stateTextContainer?.classList.add('visible')
            stateText?.setAttribute('required', 'required')
        }

        // Update validation after changing required fields
        validateForm()
    }

    form?.addEventListener('submit', (e) => {
        // Mark all fields as touched on submit attempt
        const fields = form.querySelectorAll('input, select') as NodeListOf<HTMLInputElement | HTMLSelectElement>
        fields.forEach(field => touchedFields.add(field.id))

        if (!validateForm()) {
            e.preventDefault()
            // Scroll to first error
            const firstError = form.querySelector('.invalid')
            firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else {
            // Only disable the button if form is valid
            submit?.classList.add('btn--loading')
            submit?.classList.add('btn--disabled')
            submit?.setAttribute('disabled', '')
            // Let the form submit naturally
        }
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

    // Initialize validation
    addValidationListeners()
    setRequiredFields()
}
