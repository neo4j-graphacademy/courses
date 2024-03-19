const TEXT_COPIED = 'Copied!'

export function cleanCode(raw: string, language?: string) {
    // TODO: Other languages...
    const stripped = raw.replace(/(<([^>]+)>)/gi, "");

    // Convert entities
    const el = document.createElement('textarea')
    el.innerHTML = stripped

    const converted = el.value

    return copyableCommand(converted)
}

export function copyToClipboard(cleaned: string, button?: HTMLElement) {
    if (button) {
        const text = button.innerHTML
        const width = button.clientWidth

        button.style.width = width + 'px'
        button.classList.add('btn-success')
        button.innerHTML = TEXT_COPIED

        setTimeout(function () {
            button.innerHTML = text
            button.style.width = 'auto'
            button.classList.remove('btn-success')
        }, 1000)
    }

    const textarea = document.createElement('textarea')
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'absolute'
    textarea.style.left = '-9999px'
    textarea.value = cleaned

    document.body.appendChild(textarea)
    textarea.select()

    document.execCommand('copy')
    document.body.removeChild(textarea)
}


function copyableCommand(input: string) {
    const commandContinuationRx = /\\\s*$/
    let result = input

    if (input.startsWith('$ ')) {
        const lines = result.split('\n')
        let currentCommand = ''
        const commands: any[] = []
        let commandContinuationFound: any = false
        for (const line of lines) {
            if (!commandContinuationFound && !line.startsWith('$ ')) {
                // ignore, command output
            } else {
                if (commandContinuationFound) {
                    currentCommand += '\n' + line
                } else if (line.startsWith('$ ')) {
                    currentCommand = line.substr(2, line.length)
                }
                commandContinuationFound = line.match(commandContinuationRx)
                if (!commandContinuationFound) {
                    commands.push(currentCommand)
                }
            }
        }
        result = commands.join('; ')
    }
    return result
}
