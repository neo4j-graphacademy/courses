import { track } from './modules/mixpanel'

const TEXT_COPIED = 'Copied!'

function copyableCommand(input: string) {
    const commandContinuationRx = /\\\s*$/
    let result = input

    if (input.startsWith('$ ')) {
        var lines = result.split('\n')
        var currentCommand = ''
        var commands: any[] = []
        let commandContinuationFound: any = false
        for (let i = 0; i < lines.length; i++) {
            var line = lines[i]
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

function cleanCode(raw: string, language?: string) {
    // TODO: Other languages...
    const stripped = raw.replace(/(<([^>]+)>)/gi, "");

    // Convert entities
    const el = document.createElement('textarea')
    el.innerHTML = stripped

    const converted = el.value


    return copyableCommand(converted)
}

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

function handleCopyClick(e) {
    const button = e.target as HTMLButtonElement
    const text = button.innerHTML
    const width = button.clientWidth

    // @ts-ignore
    const raw = button.parentNode.parentNode.querySelector('code').innerHTML
    const cleaned = cleanCode(raw)

    button.style.width = width + 'px'
    button.classList.add('btn-success')
    button.innerHTML = TEXT_COPIED

    setTimeout(function () {
        button.innerHTML = text
        button.style.width = 'auto'
        button.classList.remove('btn-success')
    }, 1000)

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
