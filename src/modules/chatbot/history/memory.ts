import { AIMessage, BaseMessage, HumanMessage, ToolMessage } from '@langchain/core/messages'

import {
    CHATBOT_NEO4J_HOST,
    CHATBOT_NEO4J_PASSWORD,
    CHATBOT_NEO4J_USERNAME,
    CHATBOT_NEO4J_DATABASE,
} from '../../../constants'
import { User } from '../../../domain/model/user'
import { getChatbotDriver } from '../chatbot.driver'
import { EagerResult, int } from 'neo4j-driver'

type BasePersistedMessage = {
    id: string
    name: string
    content: string
}

type PersistedAIMessage = {
    role: 'ai'
} & BasePersistedMessage

type PersistedHumanMessage = {
    role: 'human'
} & BasePersistedMessage

type PersistedToolMessage = {
    role: 'tool'
    name: string
    args: string
} & BasePersistedMessage

type PersistedMessage = PersistedAIMessage | PersistedHumanMessage | PersistedToolMessage

export const getConversationHistory = async (sessionId: string, limit: number = 60): Promise<PersistedMessage[]> => {
    const driver = await getChatbotDriver()

    const res = await driver.executeQuery<EagerResult<PersistedMessage>>(
        `
        MATCH (c:Conversation {id: $sessionId})-[:LAST_MESSAGE]->(m)
        MATCH p = ()-[:NEXT_MESSAGE*0..100]->(m)
        WHERE NOT (m)-[:NEXT_MESSAGE]->()
        WITH p ORDER BY length(p) DESC LIMIT 1
        UNWIND nodes(p) AS node

        WITH nodes(p) AS nodes, node 
        WHERE node.content IS NOT NULL AND node.type in ['human', 'ai', 'tool']

        ORDER BY node.created_at DESC LIMIT $limit 

        WITH node ORDER BY node.created_at ASC

        RETURN node.type AS role,
            node.content AS content,
            node.id AS id,
            node.name AS name,
            node.tool_call_id AS tool_call_id,
            toString(node.created_at) AS created_at,
            [ (node)-[:CALLED_TOOL]->(t)<-[r:HAS_TOOL_CALL]-(m) WHERE r.tool_call_id = node.id | r.arguments][0] AS args
    `,
        { sessionId, limit: int(limit) },
        { database: CHATBOT_NEO4J_DATABASE }
    )

    return res.records.map((record) => record.toObject())
}

export const clearConversationHistory = async (sessionId: string): Promise<void> => {
    const driver = await getChatbotDriver()
    await driver.executeQuery(
        `MATCH (c:Conversation {id: $sessionId}) DETACH DELETE c`,
        { sessionId },
        { database: CHATBOT_NEO4J_DATABASE }
    )
}

export const getLastMessageId = async (sessionId: string): Promise<string | null> => {
    const driver = await getChatbotDriver()

    const res = await driver.executeQuery(
        `
        MATCH (c:Conversation {id: $sessionId})-[:LAST_MESSAGE]->(m)
        RETURN m.id AS messageId
        `,
        { sessionId },
        { database: CHATBOT_NEO4J_DATABASE }
    )

    if (res.records.length === 0) {
        return null
    }

    return res.records[0].get('messageId')
}

// export const updateConversationHistory = async (user: User, sessionId: string, messages: BaseMessage[]): Promise<void> => {
//     const driver = await getChatbotDriver()

//     const session = await driver.session({ database: CHATBOT_NEO4J_DATABASE })

//     await session.executeWrite(async tx => {
//         // save conversation
//         await tx.run(
//             `
//             MERGE (u:User {id: $userId})
//             MERGE (c:Conversation {id: $sessionId})
//             MERGE (u)-[:HAS_CONVERSATION]->(c)
//             `,
//             { userId: user.id, sessionId }
//         )

//         // save messages
//         for (const message of messages) {
//             let toolCalls: Record<string, any>[] = []
//             let properties: Record<string, any> = {
//                 type: message.getType(),
//                 content: message.content !== '' ? message.content : null,
//                 id: message.id,
//                 name: message.name,
//             }

//             if (message instanceof AIMessage && message.tool_calls) {
//                 toolCalls = message.tool_calls?.map(toolCall => ({
//                     name: toolCall.name,
//                     args: JSON.stringify(toolCall.args),
//                     id: toolCall.id,
//                 }))
//             }
//             if (message instanceof ToolMessage) {
//                 properties.tool_call_id = message.tool_call_id;
//             }

//             // Save message(s)
//             await tx.run(`
//                 MATCH (c:Conversation {id: $sessionId})
//                 MERGE (m:Message {id: $messageId})
//                 SET m += $properties,
//                      m.created_at = datetime()
//                 MERGE (c)-[:HAS_MESSAGE]->(m)

//                 FOREACH (tool_call IN $toolCalls |
//                     MERGE (t:Tool {name: tool_call.name})
//                     MERGE (m)-[r:TOOL_CALL]->(t)
//                     SET r.args = tool_call.args, r.id = tool_call.id
//                 )

//             FOREACH (call IN [ (c)-[:HAS_MESSAGE]->(mx)-[r:TOOL_CALL]->(t) WHERE r.id = $properties.tool_call_id | r] |
//                     SET m.args = call.args
//                 )
//             `, { messageId: message.id || uuidv4(), sessionId, properties, toolCalls })

//             // Create NEXT chain
//             await tx.run(`
//                 MATCH (c:Conversation {id: $sessionId})

//                 FOREACH (r IN [ (c)-[r:LAST_MESSAGE]->() | r ] | DELETE r)
//                 WITH c

//                 MATCH (c)-[:HAS_MESSAGE]->(m)
//                 WITH c, m ORDER BY m.created_at ASC

//                 WITH c, collect(m) AS messages

//                 WITH c, messages, messages[0] AS first, messages[-1] AS last

//                 MERGE (c)-[:FIRST_MESSAGE]->(first)
//                 MERGE (c)-[:LAST_MESSAGE]->(last)

//                 WITH messages
//                 UNWIND range(0, size(messages) - 2) AS i
//                 WITH messages[i] AS current, messages[i + 1] AS next
//                 MERGE (current)-[r:NEXT]->(next)
//             `, { sessionId })

//         }
//     })

//     await session.close()
// }

// function uuidv4(): string {
//     return crypto.randomUUID()
// }
