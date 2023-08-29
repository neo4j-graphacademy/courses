import { post } from "./modules/http";
import { createElement } from "./modules/dom"
import codeBlocks from "./code-blocks";

declare global {
    interface Window {
        i18n: {
            feedbackFollowup: string;
            feedbackThankyou: string;
            missing: string;
            hardToFollow: string;
            inaccurate: string;
            other: string;
            moreInformation: string;
            feedbackSubmit: string;
            feedbackSkip: string;
            advanceTo: string;
            [key: string]: any;
        }
    }
}

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

function clarificationForm(id: string, container: HTMLDivElement) {
    const reasonId = `reason-${id}`

    const reasonLabel = createElement('label', 'conversation-clarification-label', [`What was wrong with this response?`])
    reasonLabel.setAttribute('for', reasonId)

    const reasonOption = (value, text) => {
        const option = document.createElement('option')
        option.setAttribute('value', value)
        option.innerHTML = text

        return option
    }

    const reason = createElement('select', 'conversation-clarification-select', [
        reasonOption('missing', window.i18n.missing),
        reasonOption('hard-to-follow', window.i18n.hardToFollow),
        reasonOption('inaccurate', window.i18n.inaccurate),
        reasonOption('other', window.i18n.other),
    ]) as HTMLSelectElement


    const textareaId = `additional-${id}`
    const textareaLabel = createElement('label', 'conversation-clarification-label', [`How could this response be improved?`])
    textareaLabel.setAttribute('for', textareaId)

    const textarea = document.createElement('textarea')
    textarea.setAttribute('id', textareaId)
    textarea.setAttribute('placeholder', 'eg. the answer wasn\'t relevant to my question')

    const submit = document.createElement('button')
    submit.classList.add('btn')
    submit.classList.add('btn--primary')
    submit.setAttribute('type', 'submit')
    submit.innerHTML = 'Send'

    const form = createElement('form', 'conversation-clarification-form', [
        reasonLabel,
        reason,
        textareaLabel,
        createElement('div', 'conversation-form conversation-clarification-input', [
            textarea,
            submit,
        ]),
    ])

    container.innerHTML = ''
    container.parentElement?.parentElement?.appendChild(form)

    form.addEventListener('submit', e => {
        e.preventDefault()

        container.innerHTML = '🤞'

        post(`/api/v1/chatbot/${id}/feedback`, {
            helpful: false,
            reason: reason.options[reason.selectedIndex].value,
            additional: textarea.value,
        })
            .then(() => {
                form.innerHTML = `<b>${window.i18n.feedbackThankyou}</b>`
            })
            .finally(() => {
                container.innerHTML = '👌'

                setTimeout(() => { container.innerHTML = '' }, 2000)
            })
    })
}

function sendInitialFeedback(id: string, container: HTMLDivElement, helpful: boolean, reason?: string, additional?: string) {
    container.innerHTML = '🤞'

    post(`/api/v1/chatbot/${id}/feedback`, {
        helpful,
        reason,
        additional
    })
        .catch(e => {
            console.log(e)
        })
        .finally(() => {
            // Ask for clarification
            if (!helpful) {
                return clarificationForm(id, container)
            }

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
        ]) as HTMLDivElement

        yes.addEventListener('click', e => {
            e.preventDefault()

            sendInitialFeedback(id, helpful, true)
        })

        no.addEventListener('click', e => {
            e.preventDefault()

            sendInitialFeedback(id, helpful, false)
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
