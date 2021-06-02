import { cleanCode, copyToClipboard } from './modules/clipboard'

const SANDBOX_SELECTOR = 'lesson-sandbox'
const SANDBOX_SELECTOR_VISIBLE = 'lesson-sandbox--visible'

function handlePlayClick(e) {
    const button = e.target as HTMLButtonElement

    // @ts-ignore
    const raw = button.parentNode.parentNode.querySelector('code').innerHTML
    const cleaned = cleanCode(raw)

    const sandboxWindow = document.querySelector(`.${SANDBOX_SELECTOR}`)
    const iframe = sandboxWindow!.querySelector('iframe')

    // Send to URL
    const url = new URL(iframe!.src)
    iframe!.src = `${url.pathname}?cmd=edit&arg=${encodeURIComponent(cleaned)}`

    // Open Window
    sandboxWindow!.classList.add(SANDBOX_SELECTOR_VISIBLE)
}

export function handleCopyClick(e) {
    const button = e.target as HTMLElement

    // @ts-ignore
    const raw = button.parentNode.parentNode.querySelector('code').innerHTML

    copyToClipboard(raw, button)
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
