import { NextFunction, Request, Response } from "express";
import { getConversationHistory } from "../history/memory";
import { getUser } from "../../../middleware/auth.middleware";
import { generateConversationId } from "../chatbot.utils";
import { CHATBOT_SEED_MESSAGE } from "../../../constants";
import showdown from "showdown";

export async function usesChatHistory(req: Request, res: Response, next: NextFunction) {
    const user = await getUser(req)
    if (user) {
        const sessionId = generateConversationId(user, req.path)
        const history = await getConversationHistory(sessionId)

        res.locals.converter = new showdown.Converter();
        res.locals.chatHistory = history
        res.locals.chatSessionId = sessionId
        res.locals.chatSeedMessage = CHATBOT_SEED_MESSAGE
    }

    next()
}
