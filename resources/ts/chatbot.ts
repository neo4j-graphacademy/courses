import { post } from "./modules/http";
import { createElement } from "./modules/dom"
import codeBlocks from "./code-blocks";

function thinkingElement() {
    const thinking = document.createElement('div')
    thinking.classList.add('conversation-thinking')

    thinking.appendChild(document.createElement('span'))
    thinking.appendChild(document.createElement('span'))
    thinking.appendChild(document.createElement('span'))

    return thinking
}

enum Author {
    BOT = '--bot',
    USER = '--user',
    ERROR = '--error'
}

function rpad(num: number) {
    return num.toString().padStart(2, '0')
}

function sendFeedback(id: string, helpful: boolean, container) {
    container.innerHTML = '🤞'

    post(`/api/v1/chatbot/${id}/feedback`, {
        helpful
    })
        .finally(() => {
            container.innerHTML = '👌'

            setTimeout(() => { container.innerHTML = '' }, 2000)
        })
}

function appendMessage(messages: HTMLDivElement, author: Author, html: string, id?: string) {
    const content = createElement('div', 'conversation-message-content')
    content.innerHTML = html

    const now = new Date()

    const time = createElement('time', 'conversation-message-timestamp', [
        `${rpad(now.getHours())}:${rpad(now.getMinutes())}`
    ])

    const meta = createElement('div', 'conversation-message-meta', [
        time
    ])

    const container = createElement(
        'div',
        `conversation-message conversation-message${author}`,
        [
            content,
            meta,
        ]
    )

    // Feedback button?
    if (id) {
        content.setAttribute('data-id', id)

        const yes = createElement('button', 'btn--feedback btn--positive', ['👍'])
        yes.setAttribute('title', 'This was helpful')

        const no = createElement('button', 'btn--feedback btn--negative', ['👎'])
        no.setAttribute('title', 'This was not helpful')

        const helpful = createElement('div', 'conversation-message-feedback', [
            yes, no
        ])

        yes.addEventListener('click', e => {
            e.preventDefault()

            sendFeedback(id, true, helpful)
        })

        no.addEventListener('click', e => {
            e.preventDefault()

            sendFeedback(id, false, helpful)
        })

        meta.appendChild(helpful)
    }

    messages.appendChild(container)

    container.scrollIntoView()

    codeBlocks()
}

function convertToHTMLEntities(str) {
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str;
    return tempDiv.innerHTML;
}

export default function chatbot() {
    const conversation = document.querySelector<HTMLDivElement>('.conversation')
    const form = document.querySelector<HTMLFormElement>('.conversation-form')
    const messages = document.querySelector<HTMLDivElement>('.conversation-messages')

    if (!conversation || !form || !messages) return

    const submit = form.querySelector<HTMLButtonElement>('.btn')
    const message = form.querySelector<HTMLTextAreaElement>('textarea')

    const sendMessage = () => {
        const trimmed = message?.value?.trim()

        if (!trimmed) {
            return
        }

        submit?.setAttribute('disabled', 'disabled')
        message?.setAttribute('disabled', 'disabled')

        appendMessage(messages, Author.USER, `<p>${convertToHTMLEntities(trimmed)}</p>`)

        const thinking = thinkingElement()

        messages.appendChild(thinking)
        thinking.scrollIntoView()

        if (message) {
            message.value = ''
        }

        post('chat', {
            message: trimmed,
        })
            .then(res => {
                appendMessage(messages, Author.BOT, res.data.message, res.data.id)
            })
            .catch(e => {
                appendMessage(messages, Author.ERROR, `<p><strong>Something went wrong:</strong></p><p>${e.message}</p>`)
            })
            .finally(() => {
                message?.removeAttribute('disabled')
                setTimeout(() => submit?.removeAttribute('disabled'), 2000)
                messages.removeChild(thinking)
            })
    }


    message?.addEventListener('keydown', (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            sendMessage()
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault()

        sendMessage()
    })
}
