import { Response } from 'express'
import { AIMessage, BaseMessage, SystemMessage } from '@langchain/core/messages'
import { User } from '../../domain/model/user'
import { canonical, isTruthy } from '../../utils'
import { SystemMessagePromptTemplate } from '@langchain/core/prompts'

export const sendSseEvent = (res: Response, event: string, data?: object | string) => {
    res.write(`event: ${event}\n`)
    if (data) {
        if (typeof data === 'string') {
            data.split('\n').forEach((line) => {
                res.write(`data: ${line}\n`)
            })
        } else {
            res.write(`data: ${JSON.stringify(data)}\n`)
        }
    }
    res.write('\n\n')
    if (res.flush) {
        res.flush()
    }
}

export const setupSseResponse = (res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')
    res.setHeader('Transfer-Encoding', 'chunked')
    res.flushHeaders()
}

export const handleAgentMessage = async (res: Response, message: BaseMessage) => {
    const aiMessage = message as AIMessage
    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
        for (const tool_call of aiMessage.tool_calls) {
            sendSseEvent(res, 'tool_start', {
                id: tool_call.id,
                name: tool_call.name,
                input: tool_call.args,
            })
        }
    }

    if (aiMessage.content && typeof aiMessage.content === 'string' && aiMessage.content.length > 0) {
        if (isTruthy(process.env.CHATBOT_SIMULATE_LOADING)) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
        }

        sendSseEvent(res, 'ai', aiMessage.content)
    }
}

export const handleToolMessages = (res: Response, messages: any[]) => {
    for (const message of messages) {
        if (message && message.content) {
            sendSseEvent(res, 'tool_end', {
                id: message.tool_call_id,
                output: message.content,
            })
        }
    }
}

export const generateConversationId = (user: User, path: string) => `${user.id}||-||${path.replace('/chat', '/')}`

export async function setContext(configurable: Record<string, any>): Promise<BaseMessage> {
    const { user, enrolment, requestParams } = configurable

    const replacements: Record<string, any> = {
        id: user.id,
        name: user.nickname || user.givenName || user.name,
        path: configurable.path,
        params: JSON.stringify(requestParams),
    }

    const facts = [
        `You are speaking to {name}.`,
        `Their user id is {id}.`,
        `They are visiting the page {path}.`,
        `The request params are {params}.`,
    ]

    // Enrolment for course
    if (enrolment) {
        facts.push(`They are enrolled to the "{course}" course.`)
        facts.push(enrolment.completed ? `They have completed the course.` : `They have not completed the course.`)

        replacements.course = enrolment.title

        // Find module and lesson
        if (requestParams.module) {
            const module = enrolment.modules.find((m) => m.slug === requestParams.module)
            if (module) {
                facts.push(`They are on the "{moduleTitle}" module (slug: {moduleSlug}).`)
                replacements.moduleTitle = module.title
                replacements.moduleSlug = module.slug

                if (requestParams.lesson) {
                    const lesson = module.lessons.find((l) => l.slug === requestParams.lesson)

                    if (lesson) {
                        facts.push(
                            `They are on the "{lessonTitle}" lesson (slug: {lessonSlug}) which is a {lessonType}.`
                        )
                        replacements.lessonTitle = lesson.title
                        replacements.lessonSlug = lesson.slug
                        replacements.lessonType = lesson.type
                    }
                }
            }
        }

        if (enrolment.usecase) {
            facts.push(`The course revolves around the {usecase} use case.`)
            replacements.usecase = enrolment.usecase
        }

        if (enrolment.next) {
            facts.push(`The next lesson is "${enrolment.next.title}" - ${canonical(enrolment.next.link)}.`)
        }
    }

    const template = SystemMessagePromptTemplate.fromTemplate(facts.join('\n'))
    const formatted = await template.format(replacements)
    const content = formatted.content

    return new SystemMessage({
        content,
        additional_kwargs: {
            type: 'context',
            id: `${configurable.message_id}-context`,
        },
    })
}
