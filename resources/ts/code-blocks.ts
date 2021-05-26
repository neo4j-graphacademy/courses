import { createElement } from './modules/dom'
import { track } from './modules/mixpanel'

const IGNORE_LANGUAGES = ['gram']
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

function casedLang(lang: string) {
    var cased
    switch (lang) {
        case 'csharp':
        case 'dotnet':
            cased = 'C#'
            break
        case 'javascript':
            cased = 'JavaScript'
            break
        default:
            cased = lang.charAt(0).toUpperCase() + lang.slice(1)
    }
    return cased
}

function cleanCode(raw: string, language?: string) {
    // TODO: Other languages...
    return raw.replace(/(<([^>]+)>)/gi, "");
}

function copyToClipboard(code, language) {
    var textarea = document.createElement('textarea')
    textarea.value = cleanCode(code, language)
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'absolute'
    textarea.style.left = '-9999px'

    document.body.appendChild(textarea)
    textarea.select()

    document.execCommand('copy')
    document.body.removeChild(textarea)
}

function createCopyButton(code, language) {
    const copyButton = createElement('button', 'btn btn-copy', [document.createTextNode('Copy to Clipboard')])

    copyButton.addEventListener('click', (e) => {
        e.preventDefault()
        copyToClipboard(code, language)

        var button = e.target as HTMLButtonElement
        var text = button.innerHTML
        var width = button.clientWidth

        button.style.width = width + 'px'
        button.classList.add('btn-success')
        button.innerHTML = TEXT_COPIED

        setTimeout(function () {
            button.innerHTML = text
            button.classList.remove('btn-success')
        }, 1000)
    })

    return copyButton
}

function createPlayButton(query) {
    const playButon = createElement('button', 'btn btn-play', [document.createTextNode('Play in Sandbox')])

    playButon.addEventListener('click', (e) => {
        e.preventDefault()

        // Clean Cypher
        const cypher = cleanCode(query, 'cypher')


        const sandboxWindow = document.querySelector(`.${SANDBOX_SELECTOR}`)
        const iframe = sandboxWindow!.querySelector('iframe')

        // Send to URL
        const url = new URL(iframe!.src)
        iframe!.src = `${url.pathname}?cmd=edit&arg=${encodeURIComponent(cypher)}`

        // Open Window
        sandboxWindow!.classList.add(SANDBOX_SELECTOR_VISIBLE)
    })

    return playButon
}

const SANDBOX_SELECTOR = 'lesson-sandbox'
const SANDBOX_SELECTOR_VISIBLE = 'lesson-sandbox--visible'

function addCodeHeader(pre) {
    const dotContent = pre.parentElement
    const listingBlock = dotContent.parentElement

    if (listingBlock.classList.contains('noheader')) return

    const addCopyButton = !listingBlock.classList.contains('nocopy')

    const block = pre.querySelector('code')
    const div = pre.parentNode

    const code = block.innerHTML
    let language

    if ( block.hasAttribute('class') ) {
        let languageClass = block.getAttribute('class').match(/language-([a-z0-9-])+/i)

        if (languageClass?.length > 0) {
            language = languageClass[0].replace('language-', '')
        }
    }

    if (language && IGNORE_LANGUAGES.indexOf(language.toLowerCase()) > -1) return

    const languageDiv = document.createElement('div')
    languageDiv.className = 'code-language'

    if (language) {
        languageDiv.innerHTML = casedLang(language)
    }
    const children = [languageDiv]

    if (addCopyButton) {
        // @ts-ignore
        children.push(createCopyButton(code, language))
    }

    const addPlayButton = language?.toLowerCase() === 'cypher' && !listingBlock.classList.contains('noplay') && document.querySelector(`.${SANDBOX_SELECTOR}`)

    if (addPlayButton) {
        // @ts-ignore
        children.push(createPlayButton(code))
    }

    var originalTitle = div.parentNode.querySelector('.title')
    if (originalTitle) {
        var titleDiv = document.createElement('div')
        titleDiv.className = 'code-title'
        titleDiv.innerHTML = originalTitle.innerHTML

        originalTitle.style.display = 'none'

        children.unshift(titleDiv)
    }

    var header = createElement('div', 'code-header', children)

    pre.className += ' has-header'
    div.insertBefore(header, pre)
}
export default function codeBlocks() {
    document.querySelectorAll('.highlight')
        .forEach(el => addCodeHeader(el))

}