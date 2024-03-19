import { cleanCode, copyToClipboard } from './modules/clipboard'

const SANDBOX_SELECTOR = 'classroom-sandbox'
const SANDBOX_SELECTOR_VISIBLE = 'classroom-sandbox--visible'

// TODO: Edit button

function findCode(button): string | undefined {
    let parent = button.parentNode

    while (parent && !parent.querySelector('code')) {
        parent = parent.parentElement
    }

    const code = parent.querySelector('code')
    const raw = code.innerHTML

    return cleanCode(raw)
}

function handlePlayClick(e) {
    e.stopPropagation();

    const code = findCode(e.target)

    if (code) {
        const sandboxWindow = document.querySelector(`.${SANDBOX_SELECTOR}`)
        const iframe = sandboxWindow!.querySelector('iframe')

        // Show sandbox window
        sandboxWindow!.classList.add(SANDBOX_SELECTOR_VISIBLE)

        try {
            iframe?.contentWindow?.postMessage({
                cmd: 'edit',
                arg: code
            })
        }
        catch (e) {
            // Send to URL
            const url = new URL(iframe!.src)
            iframe!.src = `${url.pathname}?cmd=edit&arg=${encodeURIComponent(code)}`
        }
    }
}

export function handleCopyClick(e) {
    let button = e.target as HTMLElement

    if (button.tagName === 'svg') {
        button = button.parentElement as HTMLElement
    }

    const code = findCode(e.target)

    if (code) {
        copyToClipboard(code, button)
    }
}


export default function codeBlocks() {
    document.querySelectorAll('.btn-copy')
        .forEach(element => {
            element.addEventListener('click', e => handleCopyClick(e))
        })

    document.querySelectorAll('.btn-play')
        .forEach(element => {
            element.addEventListener('click', e => handlePlayClick(e))
        })
}
