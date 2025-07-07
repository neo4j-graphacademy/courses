import { config } from 'dotenv'
import { HumanMessage } from '@langchain/core/messages'
import { Neo4jCheckpointSaver } from './checkpointer'
import { getChatbotDriver } from '../chatbot.driver'
import { invoke } from '../chatbot.agent'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { ChatOpenAI } from '@langchain/openai'
import { runCypherTool } from '../tools/run-cypher.tool'
import { getInstanceCredentialsTool } from '../tools/get-instance-credentials.tool'
import { verifyChallengeTool } from '../tools/verify-challenge.tool'
import { getCourseSummariesTool } from '../tools/get-course-summaries.tool'
import { getLessonContentTool } from '../tools/get-lesson-content.tool'
import { CHATBOT_NEO4J_DATABASE, OPENAI_API_KEY, OPENAI_CHAT_MODEL } from '../../../constants'
import { START } from '@langchain/langgraph'

import { Response } from 'express'
import { User } from '../../../domain/model/user'

// Mock user for testing
const mockUser = {
    sub: 'test-user-id',
    email: 'test@example.com',
    givenName: 'Test User',
} as User

const mockResponse = {
    status: 200,
    send: jest.fn(),
    setHeader: jest.fn(),
    write: jest.fn(),
    end: jest.fn(),
    flushHeaders: jest.fn(),
    sendStatus: jest.fn(),
    links: jest.fn(),
    json: jest.fn(),
} as unknown as Response

const mockConfigurable = {
    user_id: mockUser.sub,
    email: mockUser.email,
    givenName: mockUser.givenName,
    enrolment: {},
    instance: {
        id: 'test-instance-id',
        ip: '127.0.0.1',
        host: 'localhost',
        boltPort: '7687',
        username: 'neo4j',
        password: 'password',
    },
    page: '/test',
    requestParams: {},
    course: null,
    module: null,
    lesson: null,
}

describe('Neo4jCheckpointSaver Integration Tests', () => {
    let checkpointer: Neo4jCheckpointSaver
    let driver: any
    let agent: any
    const conversationId = `test-conversation-${Date.now()}-${Math.random()}`

    beforeAll(async () => {
        config()

        driver = await getChatbotDriver()
        // agent = await createChatbotAgent()
    })

    afterAll(async () => {
        // // Clean up test data
        // for (const conversationId of testConversationIds) {
        //     await cleanupTestData(conversationId);
        // }

        if (driver) {
            await driver.close()
        }
    })

    // it('should create initial message in database', async () => {
    //     const input = 'What are my database credentials?'
    //     const first = await invoke(
    //         {
    //             status: 200,
    //             send: jest.fn(),
    //             setHeader: jest.fn(),
    //             write: jest.fn(),
    //             end: jest.fn(),
    //             flushHeaders: jest.fn(),
    //             sendStatus: jest.fn(),
    //             links: jest.fn(),
    //             json: jest.fn(),
    //         } as unknown as Response,
    //         mockUser,
    //         conversationId,
    //         input,
    //         mockConfigurable,
    //     )

    //     // check database
    //     const res = await driver.executeQuery(
    //         `MATCH (c:Conversation {id: $conversationId})-[:HAS_MESSAGE]->(m:CheckpointMessage)
    //         RETURN m.type AS type, m.content AS content`,
    //         { conversationId },
    //         { database: CHATBOT_NEO4J_DATABASE }
    //     )

    //     // tools: system, human, ai, tool call, ai
    //     expect(res.records.length).toBe(5)

    //     // system: you are speaking to...
    //     expect(res.records[0].get('type')).toBe('system')

    //     // human: {input}
    //     expect(res.records[1].get('type')).toBe('human')
    //     expect(res.records[1].get('content')).toBe(input)

    //     // ai to select tool -> getInstanceCredentials
    //     // tool call for instance id {mockConfigurable.instance}

    //     // response contains 127.0.0.1
    //     expect(res.records[4].get('content')).toContain(mockConfigurable.instance.ip)
    // })

    it('should append additional messages to the conversation', async () => {
        const conversationId = `test-conversation-${Date.now()}-${Math.random()}`

        // const input = 'how many nodes are in my graph?'
        const input = 'What are my database credentials?'
        const followup = 'Thank you.'

        await invoke(mockResponse, mockUser, conversationId, input, mockConfigurable)

        await invoke(mockResponse, mockUser, conversationId, followup, mockConfigurable)

        // check database
        const res = await driver.executeQuery(
            `MATCH (c:Conversation {id: $conversationId})-[:HAS_MESSAGE]->(m:CheckpointMessage)
            RETURN m.type AS type, m.content AS content ORDER BY m.created_at ASC`,
            { conversationId },
            { database: CHATBOT_NEO4J_DATABASE }
        )

        // tools: system, human, ai, tool call, ai, human, ai
        // expect(res.records.length).toBe(7) //  =5

        // system: you are speaking to...
        expect(res.records[0].get('type')).toBe('system')

        // human: {input}
        expect(res.records[1].get('type')).toBe('human')
        expect(res.records[1].get('content')).toBe(input)

        // ai to select tool -> getInstanceCredentials
        expect(res.records[2].get('type')).toBe('ai')

        // tool call for instance id {mockConfigurable.instance}
        expect(res.records[3].get('type')).toBe('tool')

        // response contains 127.0.0.1
        expect(res.records[4].get('content')).toContain(mockConfigurable.instance.ip)

        expect(res.records[5].get('type')).toBe('human')
        expect(res.records[5].get('content')).toBe(followup)

        expect(res.records[6].get('type')).toBe('ai')
    }, 20000)
})
