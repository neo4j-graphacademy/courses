import { ChatOpenAI } from '@langchain/openai'
import { CompiledStateGraph, StateGraphArgs } from '@langchain/langgraph'
import { BaseMessage, HumanMessage } from '@langchain/core/messages'
import {
    CHATBOT_NEO4J_DATABASE,
    CHATBOT_NEO4J_HOST,
    CHATBOT_NEO4J_PASSWORD,
    CHATBOT_NEO4J_USERNAME,
    OPENAI_API_KEY,
    OPENAI_CHAT_MODEL,
} from '../../constants'
import { Express, Response } from 'express'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { handleAgentMessage, handleToolMessages, sendSseEvent, setContext, setupSseResponse } from './chatbot.utils'
import { runCypherTool } from './tools/run-cypher.tool'
import { getInstanceCredentialsTool } from './tools/get-instance-credentials.tool'
import { User } from '../../domain/model/user'
import { verifyChallengeTool } from './tools/verify-challenge.tool'
import { resetDatabaseTool } from './tools/reset-database.tool'
import { getCourseSummariesTool } from './tools/get-course-summaries.tool'
import { getLessonContentTool } from './tools/get-lesson-content.tool'
import { provideFeedbackTool } from './tools/provide-feedback.tool'
import { Neo4jCheckpointSaver } from './history/checkpointer'
import { getChatbotDriver } from './chatbot.driver'
import { clearConversationHistory } from './history/memory'
import { getModuleContentTool } from './tools/get-module-content.tool'

const llm = new ChatOpenAI({
    apiKey: OPENAI_API_KEY,
    model: OPENAI_CHAT_MODEL,
})

// Define the state for our graph
interface AgentState {
    messages: BaseMessage[]
}

const graphState: StateGraphArgs<AgentState>['channels'] = {
    messages: {
        value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
        default: () => [],
    },
}

const tools = [
    runCypherTool,
    getInstanceCredentialsTool,
    verifyChallengeTool,
    resetDatabaseTool,
    getCourseSummariesTool,
    getLessonContentTool,
    getModuleContentTool,
    provideFeedbackTool,
]

let agent
let driver

export default async function initChatbot(app: Express): Promise<boolean> {
    if (CHATBOT_NEO4J_HOST && CHATBOT_NEO4J_USERNAME && CHATBOT_NEO4J_PASSWORD) {
        // Init chatbot agent
        await createChatbotAgent()

        return true
    }

    return false
}

let checkpointer: Neo4jCheckpointSaver | undefined

export async function getCheckpointer(): Promise<Neo4jCheckpointSaver> {
    if (!checkpointer) {
        driver = await getChatbotDriver()
        checkpointer = new Neo4jCheckpointSaver({
            driver,
            database: CHATBOT_NEO4J_DATABASE,
        })
    }

    return checkpointer
}

async function createChatbotAgent(): Promise<CompiledStateGraph<AgentState, AgentState, any, any, any, any>> {
    if (!agent) {
        checkpointer = await getCheckpointer()

        agent = createReactAgent({
            llm,
            tools,
            checkpointer,
        })
    }

    return agent
}

export async function invoke(
    res: Response,
    user: User,
    sessionId: string,
    input: string,
    configurable: Record<string, any>
): Promise<void> {
    setupSseResponse(res)

    // TODO: add more slash commands
    if (input === '/clear') {
        await clearConversationHistory(sessionId)

        sendSseEvent(res, 'ai', 'Conversation history cleared')
        sendSseEvent(res, 'end')

        res.end()

        return
    }

    const updatedConfigurable = {
        ...configurable,
        thread_id: sessionId,
        user,
    }

    const messages: BaseMessage[] = [await setContext(updatedConfigurable), new HumanMessage({ content: input })]

    // const history = await getConversationHistory(sessionId);

    // if (history.length == 0) {
    //     const context = await setContext(configurable)
    //     // put context to start of messages
    //     messages.unshift(context)
    // }

    const agent = await createChatbotAgent()

    let lastMessageId: string | undefined

    const stream = await agent.stream(
        {
            messages,
        },
        {
            recursionLimit: 10,
            configurable: updatedConfigurable,
            streamMode: 'updates',
        }
    )

    for await (const streamEvent of stream) {
        if ('agent' in streamEvent && streamEvent.agent && streamEvent.agent.messages) {
            const agentMessages = Array.isArray(streamEvent.agent.messages)
                ? streamEvent.agent.messages
                : [streamEvent.agent.messages]
            if (agentMessages.length > 0) {
                const message = agentMessages[agentMessages.length - 1]

                if (message instanceof BaseMessage) {
                    await handleAgentMessage(res, message)

                    messages.push(message)

                    lastMessageId = message.id
                }
            }
        } else if ('tools' in streamEvent && streamEvent.tools && Array.isArray(streamEvent.tools.messages)) {
            handleToolMessages(res, streamEvent.tools.messages)

            for (const toolMessage of streamEvent.tools.messages) {
                if (toolMessage instanceof BaseMessage) {
                    messages.push(toolMessage)
                }
            }
        }
    }

    // Send end event
    sendSseEvent(res, 'end', { id: lastMessageId })

    res.end()
}
