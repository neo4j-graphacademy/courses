import { z } from "zod";
import { RunnableConfig } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";
import provideFeedback from "../services/provide-feedback";
import { getLastMessageId } from "../history/memory";

const feedbackSchema = z.object({
    helpful: z.boolean().describe("Whether the response was helpful (true) or not helpful (false)."),
    reason: z.string().optional().describe("Reason for the feedback - required when helpful is false."),
    additional: z.string().optional().describe("Additional feedback details that may help to improve future responses.")
});

async function handleFeedback(input: z.infer<typeof feedbackSchema>, config?: RunnableConfig) {
    if (!config?.configurable?.user) {
        throw new Error('User must be authenticated to provide feedback.')
    }

    if (!config?.configurable?.thread_id) {
        throw new Error('Thread ID is required to provide feedback.')
    }

    const { helpful, reason, additional } = input;
    const user = config.configurable.user;
    const sessionId = config.configurable.thread_id;

    // Validate that reason is provided for negative feedback
    if (!helpful && !reason) {
        return "I need more information to record your negative feedback. Please provide a reason for why the response wasn't helpful. What specifically could be improved?";
    }

    // Get the last message ID for this session
    const messageId = await getLastMessageId(sessionId);
    
    if (!messageId) {
        return "No messages found in this conversation to provide feedback for.";
    }

    // Provide the feedback
    const result = await provideFeedback(user, messageId, helpful, reason || null, additional || null);

    if (result.errors) {
        if (result.errors.message) {
            return `Error: ${result.errors.message}`;
        }
        return `Validation failed: ${Object.values(result.errors).join(', ')}`;
    }

    if (helpful) {
        return "Thank you for your positive feedback! I'm glad I could help you.";
    } else {
        return "Thank you for your feedback. I'll use this information to improve my responses in the future.";
    }
}

export const provideFeedbackTool = tool(handleFeedback, {
    name: 'provideFeedback',
    description: `
    Provide feedback on the assistant's response. Use this tool when the user wants to give feedback about whether a response was helpful or not.
    
    For positive feedback, only the 'helpful: true' parameter is required.
    For negative feedback, both 'helpful: false' and 'reason' parameters are required to understand what went wrong.
    
    The tool will automatically target the last message in the conversation.
    `,
    schema: feedbackSchema
}); 