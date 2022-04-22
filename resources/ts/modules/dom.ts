export function createElement(element: string, classes: string, children?: (HTMLElement | Text | string)[]) {
    const output = document.createElement(element)
    output.setAttribute('class', classes)

    children?.forEach(child => {
        if (typeof child === 'string') {
            child = document.createTextNode(child)
        }

        output.appendChild(child)
    })

    return output
}

export function removeElement(parent: HTMLElement, selector: string) {
    parent.querySelectorAll(`.${selector}`).forEach(showHintButton => showHintButton.parentElement!.removeChild(showHintButton))
}
