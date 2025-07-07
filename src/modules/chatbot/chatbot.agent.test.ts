import { invoke } from "./chatbot.agent";
import { getConversationHistory, updateConversationHistory } from './history/memory';
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";

jest.mock('./history/memory');

describe('Chatbot Agent', () => {
    let res: any;

    beforeEach(() => {
        res = {
            write: jest.fn(),
            setHeader: jest.fn(),
            flushHeaders: jest.fn(),
            end: jest.fn(),
            flush: jest.fn(),
        };
        (getConversationHistory as jest.Mock).mockReturnValue([]);
        (updateConversationHistory as jest.Mock).mockClear();
    });

    it('should call a tool and return the output', async () => {
        await invoke(res, 'test-session-tool', 'how many r\'s are in "strawberry"?');

        // get history from memory
        expect(getConversationHistory).toHaveBeenCalledWith('test-session-tool');
        
        // Check for tool start, end, and final AI response
        expect(res.write).toHaveBeenCalledWith('event: tool_start\\n');
        expect(res.write).toHaveBeenCalledWith(expect.stringContaining('"name":"lettersInWord"'));
        expect(res.write).toHaveBeenCalledWith('event: tool_end\\n');
        expect(res.write).toHaveBeenCalledWith(expect.stringContaining('3'));
        expect(res.write).toHaveBeenCalledWith('event: ai\\n');
        expect(res.write).toHaveBeenCalledWith('event: end\\n');

        // Verify history update
        expect(updateConversationHistory).toHaveBeenCalledTimes(1);
    }, 10000);

    it('should maintain conversation history', async () => {
        // First message
        await invoke(res, 'test-session-history', 'my name is Adam');

        // Mock the history for the next call
        const history: BaseMessage[] = [
            new HumanMessage('my name is Adam'),
            new AIMessage({ content: 'Nice to meet you, Adam!' }),
        ];
        (getConversationHistory as jest.Mock).mockReturnValue(history);

        // Second message
        await invoke(res, 'test-session-history', 'what is my name?');

        // Check that the AI remembers the name
        expect(res.write).toHaveBeenCalledWith('event: ai\\n');
        expect(res.write).toHaveBeenCalledWith(expect.stringContaining('Adam'));

        // Verify history was updated twice
        expect(updateConversationHistory).toHaveBeenCalledTimes(2);
    });
}); 