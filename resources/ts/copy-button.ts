import { copyToClipboard } from './modules/clipboard'
import { createElement } from './modules/dom'

export function handleCopyClick(e) {
    e.preventDefault()
    const button = e.target.parentNode as HTMLElement
    const label = button.querySelector('.btn-label') as HTMLElement

    if (label && label.parentNode && label.parentNode.querySelector('.target')) {
        const raw = label.parentNode!.querySelector('.target')!.innerHTML

        copyToClipboard(raw, label)
    }
}

export default function copyButtons() {
    document.querySelectorAll('span.copy')
        .forEach(element => {
            const parent = element.parentElement
            // @ts-ignore
            const target = createElement('span', 'target', Array.from(element.childNodes))
            const label = createElement('span', 'btn-label', ['Copy Text'])

            const children = [target, label]

            // @ts-ignore
            const button = createElement('button', 'btn-inline-copy notranslate', children)

            button.addEventListener('click', e => handleCopyClick(e))

            // @ts-ignore
            parent.insertBefore(button, element)
            // @ts-ignore
            parent.removeChild(element)

        })
}
