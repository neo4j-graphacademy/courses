import { AIMessage, BaseMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { createDriver } from "../../neo4j";
import { CHATBOT_NEO4J_HOST, CHATBOT_NEO4J_PASSWORD, CHATBOT_NEO4J_USERNAME } from "../../../constants";
import { User } from "../../../domain/model/user";

const conversations = new Map<string, BaseMessage[]>();

conversations.set('8eb9f129-a0d5-43a3-a115-3ea99f491e93||-||/neo4j-fundamentals/1-graph-thinking/', [
    new HumanMessage('Hello, how are you?'),
    new ToolMessage({
        tool_call_id: '123',
        name: 'lettersInWord',
        content: '{"word": "hello", "search": "h"}',
    }),
    new AIMessage('I am good, thank you!'),
])

export const getConversationHistory = async (sessionId: string): Promise<BaseMessage[]> => {
    return conversations.get(sessionId) || [];
};

export const updateConversationHistory = async (user: User, sessionId: string, messages: BaseMessage[]) => {
    const history = await getConversationHistory(sessionId);
    history.push(...messages);
    conversations.set(sessionId, history);
} 
