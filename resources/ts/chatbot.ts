import { post } from './modules/http'
import { createElement } from './modules/dom'
import codeBlocks from './code-blocks'
import highlight from './highlight'
import showdown from 'showdown'

declare global {
    interface Window {
        i18n: {
            feedbackFollowup: string
            feedbackThankyou: string
            missing: string
            hardToFollow: string
            inaccurate: string
            other: string
            moreInformation: string
            feedbackSubmit: string
            feedbackSkip: string
            advanceTo: string
            [key: string]: any
        }
    }
}

// Define the Showdown extension
showdown.extension('codeWithCopyButton', function () {
    return [
        {
            type: 'output',
            filter: function (text) {
                const wrapper = document.createElement('div')
                wrapper.innerHTML = text

                wrapper.querySelectorAll('pre').forEach((preElement) => {
                    if (preElement.parentElement?.classList.contains('code-container')) {
                        return
                    }

                    const container = document.createElement('div')
                    container.classList.add('code-container')

                    const button = document.createElement('button')
                    button.classList.add('btn-copy')
                    button.setAttribute('title', 'Copy code')
                    button.innerHTML = 'Copy'

                    preElement.parentNode?.replaceChild(container, preElement)
                    container.appendChild(button)
                    container.appendChild(preElement)
                })

                return wrapper.innerHTML
            },
        },
    ]
})

function thinkingElement() {
    const thinking = document.createElement('div')
    thinking.classList.add('conversation-thinking')

    thinking.appendChild(document.createElement('span'))
    thinking.appendChild(document.createElement('span'))
    thinking.appendChild(document.createElement('span'))

    return thinking
}

enum Author {
    AI = '--ai',
    USER = '--human',
    ERROR = '--error',
    TOOL = '--tool',
}

function rpad(num: number) {
    return num.toString().padStart(2, '0')
}

function clarificationForm(id: string, container: HTMLDivElement) {
    const reasonId = `reason-${id}`

    const reasonLabel = createElement('label', 'conversation-clarification-label', [
        `What was wrong with this response?`,
    ])
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
    const textareaLabel = createElement('label', 'conversation-clarification-label', [
        `How could this response be improved?`,
    ])
    textareaLabel.setAttribute('for', textareaId)

    const textarea = document.createElement('textarea')
    textarea.setAttribute('id', textareaId)
    textarea.setAttribute('placeholder', "eg. the answer wasn't relevant to my question")

    const submit = document.createElement('button')
    submit.classList.add('btn')
    submit.classList.add('btn--primary')
    submit.setAttribute('type', 'submit')
    submit.innerHTML = 'Send'

    const form = createElement('form', 'conversation-clarification-form', [
        reasonLabel,
        reason,
        textareaLabel,
        createElement('div', 'conversation-form conversation-clarification-input', [textarea, submit]),
    ])

    container.innerHTML = ''
    container.parentElement?.parentElement?.appendChild(form)

    form.addEventListener('submit', (e) => {
        e.preventDefault()

        container.innerHTML = '🤞'

        post(`/api/v1/chatbot/${id}/feedback`, {
            helpful: false,
            reason: reason.options[reason.selectedIndex].value,
            additional: textarea.value,
        })
            .then(() => {
                form.innerHTML = `<b>${window.i18n.feedbackThankyou}</b>`
                setTimeout(() => {
                    form.remove()
                }, 2000)
            })
            .catch((e) => {
                console.log(e)
                form.innerHTML = `<b>Error submitting feedback</b>`
                setTimeout(() => {
                    form.remove()
                }, 2000)
            })
    })
}

function sendInitialFeedback(
    id: string,
    container: HTMLDivElement,
    helpful: boolean,
    reason?: string,
    additional?: string
) {
    container.innerHTML = '🤞'

    post(`/api/v1/chatbot/${id}/feedback`, {
        helpful,
        reason,
        additional,
    })
        .then(() => {
            container.innerHTML = '👌'
            setTimeout(() => {
                container.innerHTML = ''
            }, 2000)
        })
        .catch((e) => {
            console.log(e)
            container.innerHTML = 'Error'
            setTimeout(() => {
                container.innerHTML = ''
            }, 2000)
        })
        .finally(() => {
            // Ask for clarification
            if (!helpful) {
                return clarificationForm(id, container)
            }
        })
}

function appendMessage(messages: HTMLDivElement, author: Author, html: string, id?: string) {
    const content = createElement('div', 'conversation-message-content')
    content.innerHTML = html

    const now = new Date()

    const time = createElement('time', 'conversation-message-timestamp', [
        `${rpad(now.getHours())}:${rpad(now.getMinutes())}`,
    ])

    const meta = createElement('div', 'conversation-message-meta', [time])

    const container = createElement('div', `conversation-message conversation-message${author}`, [content, meta])

    // Feedback button?
    if (id) {
        content.setAttribute('data-id', id)

        const yes = createElement('button', 'btn--feedback btn--positive', ['👍'])
        yes.setAttribute('title', 'This was helpful')

        const no = createElement('button', 'btn--feedback btn--negative', ['👎'])
        no.setAttribute('title', 'This was not helpful')

        const helpful = createElement('div', 'conversation-message-feedback', [yes, no]) as HTMLDivElement

        yes.addEventListener('click', (e) => {
            e.preventDefault()

            sendInitialFeedback(id, helpful, true)
        })

        no.addEventListener('click', (e) => {
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
    const tempDiv = document.createElement('div')
    tempDiv.textContent = str
    return tempDiv.innerHTML
}

function createBotMessage(
    messages: HTMLDivElement,
    author: Author = Author.AI
): { container: HTMLDivElement; content: HTMLDivElement } {
    const content = createElement('div', 'conversation-message-content') as HTMLDivElement

    const now = new Date()
    const time = createElement('time', 'conversation-message-timestamp', [
        `${rpad(now.getHours())}:${rpad(now.getMinutes())}`,
    ])
    const meta = createElement('div', 'conversation-message-meta', [time]) as HTMLDivElement

    const container = createElement('div', `conversation-message conversation-message${author}`, [
        content,
        meta,
    ]) as HTMLDivElement
    messages.appendChild(container)

    return { container, content }
}

export default function chatbot() {
    const conversation = document.querySelector<HTMLDivElement>('.conversation')
    const form = document.querySelector<HTMLFormElement>('.conversation-form')
    const messages = document.querySelector<HTMLDivElement>('.conversation-messages')

    if (!conversation || !form || !messages) return

    const submit = form.querySelector<HTMLButtonElement>('.btn')
    const message = form.querySelector<HTMLTextAreaElement>('textarea')
    let sessionId: string | null = form.dataset.sessionId || null
    let lastSentMessage: string = '' // Store the last sent message for up arrow recall
    const converter = new showdown.Converter({
        ghCodeBlocks: true,
        extensions: ['codeWithCopyButton'],
    })

    const sendMessage = async () => {
        const trimmed = message?.value?.trim()

        if (!trimmed) {
            return
        }

        if (!sessionId) {
            appendMessage(
                messages,
                Author.ERROR,
                `<p><strong>Something went wrong:</strong></p><p>No session ID found</p>`
            )
            return
        }

        submit?.setAttribute('disabled', 'disabled')
        message?.setAttribute('disabled', 'disabled')

        // Store the message before sending
        lastSentMessage = trimmed

        appendMessage(messages, Author.USER, `<p>${convertToHTMLEntities(trimmed)}</p>`)

        const thinking = thinkingElement()

        messages.appendChild(thinking)
        thinking.scrollIntoView()

        if (message) {
            message.value = ''
        }

        try {
            const response = await fetch('chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: trimmed, sessionId }),
            })

            // Check if the response was successful
            if (!response.ok) {
                let errorMessage = `<p><strong>Something went wrong:</strong></p><p>Server returned ${response.status} ${response.statusText}</p>`

                // Try to get error details from response body if available
                try {
                    const errorText = await response.text()
                    if (errorText) {
                        errorMessage += `<p><strong>Details:</strong> ${convertToHTMLEntities(errorText)}</p>`
                    }
                } catch (e) {
                    // Ignore if we can't read the error body
                }

                appendMessage(messages, Author.ERROR, errorMessage)
                message?.removeAttribute('disabled')
                submit?.removeAttribute('disabled')

                if (thinking.parentElement) {
                    messages.removeChild(thinking)
                }
                return
            }

            if (response.body) {
                const reader = response.body.getReader()
                const decoder = new TextDecoder()
                let done = false
                let buffer = ''

                while (!done) {
                    const { value, done: readerDone } = await reader.read()
                    done = readerDone
                    const chunk = decoder.decode(value, { stream: true })
                    buffer += chunk

                    let boundary
                    while ((boundary = buffer.indexOf('\n\n')) !== -1) {
                        const message = buffer.substring(0, boundary)
                        buffer = buffer.substring(boundary + 2)

                        let eventType = 'message'
                        let eventData = ''
                        const lines = message.split('\n')

                        for (const line of lines) {
                            if (line.startsWith('event:')) {
                                eventType = line.substring(6).trim()
                            } else if (line.startsWith('data:')) {
                                if (eventData) {
                                    eventData += '\n'
                                }
                                eventData += line.substring(5)
                            }
                        }

                        if (eventType === 'end') {
                            const messageInput = form.querySelector<HTMLTextAreaElement>('textarea')
                            messageInput?.removeAttribute('disabled')
                            submit?.removeAttribute('disabled')

                            // Parse the end event data to get the message ID
                            if (eventData) {
                                try {
                                    const endData = JSON.parse(eventData)
                                    if (endData.id) {
                                        // Find the last AI message and add feedback buttons
                                        const aiMessages = messages.querySelectorAll(
                                            '.conversation-message.conversation-message--ai'
                                        )
                                        const lastAiMessage = aiMessages[aiMessages.length - 1]

                                        if (lastAiMessage) {
                                            const content = lastAiMessage.querySelector('.conversation-message-content')
                                            const meta = lastAiMessage.querySelector('.conversation-message-meta')

                                            if (content && meta) {
                                                // Set the message ID on the content
                                                content.setAttribute('data-id', endData.id)

                                                // Add feedback buttons
                                                const yes = createElement('button', 'btn--feedback btn--positive', [
                                                    '👍',
                                                ])
                                                yes.setAttribute('title', 'This was helpful')
                                                const no = createElement('button', 'btn--feedback btn--negative', [
                                                    '👎',
                                                ])
                                                no.setAttribute('title', 'This was not helpful')
                                                const helpful = createElement('div', 'conversation-message-feedback', [
                                                    yes,
                                                    no,
                                                ]) as HTMLDivElement

                                                yes.addEventListener('click', (e) => {
                                                    e.preventDefault()
                                                    sendInitialFeedback(endData.id, helpful, true)
                                                })

                                                no.addEventListener('click', (e) => {
                                                    e.preventDefault()
                                                    sendInitialFeedback(endData.id, helpful, false)
                                                })

                                                meta.appendChild(helpful)
                                            }
                                        }
                                    }
                                } catch (e) {
                                    console.error('Error parsing end event data:', e)
                                }
                            }

                            continue
                        }

                        if (eventData) {
                            if (eventType === 'tool_start') {
                                const data = JSON.parse(eventData)
                                const { container, content } = createBotMessage(messages, Author.TOOL)
                                container.id = `tool-call-${data.id}`

                                const toolDetail = document.createElement('details')
                                toolDetail.classList.add('conversation-message-tool')
                                const summary = document.createElement('summary')
                                summary.innerHTML = `Using tool: <strong>${data.name}</strong>`
                                toolDetail.appendChild(summary)

                                const inputContainer = document.createElement('details')
                                const inputLabel = document.createElement('summary')
                                inputLabel.innerText = 'Input'
                                const inputPre = document.createElement('pre')
                                inputPre.innerHTML = convertToHTMLEntities(JSON.stringify(data.input, null, 2))
                                inputContainer.appendChild(inputLabel)
                                inputContainer.appendChild(inputPre)
                                toolDetail.appendChild(inputContainer)

                                content.appendChild(toolDetail)

                                messages.appendChild(thinking)
                                thinking.scrollIntoView()
                            } else if (eventType === 'tool_end') {
                                const data = JSON.parse(eventData)
                                const toolContainer = document.getElementById(`tool-call-${data.id}`)
                                if (toolContainer) {
                                    const toolDetail = toolContainer.querySelector('details')
                                    if (toolDetail) {
                                        const outputContainer = document.createElement('details')
                                        const outputLabel = document.createElement('summary')
                                        outputLabel.innerText = 'Output'

                                        const pre = document.createElement('pre')
                                        let output = data.output
                                        try {
                                            output = JSON.stringify(JSON.parse(data.output), null, 2)
                                        } catch (e) {
                                            // Not a JSON string
                                        }

                                        pre.innerHTML = convertToHTMLEntities(output)

                                        outputContainer.appendChild(outputLabel)
                                        outputContainer.appendChild(pre)

                                        toolDetail.appendChild(outputContainer)

                                        codeBlocks()
                                        toolContainer.scrollIntoView()
                                    }
                                }
                            } else if (eventType === 'ai') {
                                const { container, content } = createBotMessage(messages, Author.AI)
                                const html = converter.makeHtml(eventData)
                                content.innerHTML = html

                                // open links in a new window
                                content.querySelectorAll('a').forEach((a) => {
                                    a.setAttribute('target', '_blank')
                                    a.setAttribute('rel', 'noopener noreferrer')
                                })

                                // Formatting
                                codeBlocks()
                                highlight()

                                // Re-add the thinking element
                                messages.appendChild(thinking)

                                // Scroll the bottom message into view
                                thinking.scrollIntoView()
                            }
                        }
                    }
                }
            } else {
                appendMessage(
                    messages,
                    Author.ERROR,
                    `<p><strong>Something went wrong:</strong></p><p>No response body</p>`
                )
                message?.removeAttribute('disabled')
                submit?.removeAttribute('disabled')
            }
        } catch (error) {
            // Handle network errors and other exceptions
            const errorMessage =
                error instanceof Error
                    ? `<p><strong>Network Error:</strong></p><p>${convertToHTMLEntities(error.message)}</p>`
                    : `<p><strong>An unexpected error occurred</strong></p>`

            appendMessage(messages, Author.ERROR, errorMessage)
            message?.removeAttribute('disabled')
            submit?.removeAttribute('disabled')
        }

        if (thinking.parentElement) {
            messages.removeChild(thinking)
        }
    }

    message?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            sendMessage()
        } else if (event.key === 'ArrowUp' && message.value.trim() === '' && lastSentMessage) {
            // Fill with last sent message when up arrow is pressed in empty textarea
            event.preventDefault()
            message.value = lastSentMessage
        }
    })

    form.addEventListener('submit', (e) => {
        e.preventDefault()

        sendMessage()
    })

    // Scroll to the bottom message on page load
    const lastMessage = messages.querySelector('.conversation-message:last-child')
    if (lastMessage) {
        lastMessage.scrollIntoView()
    }

    // Initialize feedback buttons for pre-rendered messages
    const initializeFeedbackButtons = () => {
        const feedbackContainers = document.querySelectorAll('.conversation-message-feedback')

        feedbackContainers.forEach((container) => {
            const messageContent = container
                .closest('.conversation-message')
                ?.querySelector('.conversation-message-content')
            const messageId = messageContent?.getAttribute('data-id')

            if (messageId) {
                const yesButton = container.querySelector('.btn--positive')
                const noButton = container.querySelector('.btn--negative')

                if (yesButton && noButton) {
                    // Remove existing event listeners to avoid duplicates
                    yesButton.replaceWith(yesButton.cloneNode(true))
                    noButton.replaceWith(noButton.cloneNode(true))

                    // Get the new references after cloning
                    const newYesButton = container.querySelector('.btn--positive')
                    const newNoButton = container.querySelector('.btn--negative')

                    newYesButton?.addEventListener('click', (e) => {
                        e.preventDefault()
                        sendInitialFeedback(messageId, container as HTMLDivElement, true)
                    })

                    newNoButton?.addEventListener('click', (e) => {
                        e.preventDefault()
                        sendInitialFeedback(messageId, container as HTMLDivElement, false)
                    })
                }
            }
        })
    }

    // Initialize feedback buttons on load
    initializeFeedbackButtons()
}
