import { logUiEvent } from './modules/events'

export default function exam() {
    const body = document.querySelector('body')

    if (!body?.classList.contains('layout--exam')) {
        return
    }

    // Track window focus/blur
    window.addEventListener('blur', () => {
        logUiEvent('window-blur', {
            source: 'exam',
            timestamp: new Date().toISOString(),
        })
    })

    window.addEventListener('focus', () => {
        logUiEvent('window-focus', {
            source: 'exam',
            timestamp: new Date().toISOString(),
        })
    })

    // Track copy events
    document.addEventListener('copy', (e) => {
        console.log('copy detected', e)
        const selection = document.getSelection()
        if (selection && selection.toString().trim()) {
            logUiEvent('content-copied', {
                content: selection.toString(),
                source: 'exam',
                type: 'selection',
            })
        }
    })

    // Track paste events
    document.addEventListener('paste', (e) => {
        console.log('paste detected', e, e.clipboardData?.getData('text/plain'))
        logUiEvent('content-pasted', {
            source: 'exam',
            target: e.target instanceof HTMLElement ? e.target.tagName.toLowerCase() : 'unknown',
            content: e.clipboardData?.getData('text/plain') || '',
        })
    })

    const submit = document.querySelector('.btn--primary')

    if (submit) {
        submit.setAttribute('disabled', 'disabled')

        document.querySelectorAll('input, textarea, select').forEach((el) =>
            el.addEventListener('change', () => {
                submit.removeAttribute('disabled')
                submit.classList.remove('btn--hidden')
            })
        )
    }

    const remaining = document.querySelector('.progress-remaining')

    if (remaining !== undefined && typeof remaining?.getAttribute('data-expires') === 'string') {
        const expires = new Date(remaining.getAttribute('data-expires') as string)

        let timeout

        const pad = (input: number) => ('00' + input).slice(-2)

        const calculateRemaining = () => {
            const now = new Date()
            const time = new Date(now.toUTCString()).getTime()

            const difference = expires.getTime() - time

            if (difference < 0) {
                clearInterval(timeout)
            }

            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((difference % (1000 * 60)) / 1000)

            remaining.innerHTML = `${pad(minutes)}:${pad(seconds)}`
        }

        timeout = setInterval(calculateRemaining, 1000)
        calculateRemaining()
    }
}
