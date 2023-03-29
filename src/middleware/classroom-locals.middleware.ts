import { NextFunction, Request, Response } from "express";
import { CHAT_TITLE, COMMUNITY_TITLE, COMMUNITY_LINK, CHAT_LINK, CHAT_JSON, COMMUNITY_BASE_URL } from "../constants";
import { getChatStatistics } from "../domain/services/chat/get-chat-statistics";
import { getCommunityTopics } from "../domain/services/community/get-community-topics";
import { FeedbackType, getFeedback } from "../domain/services/feedback/get-feedback";
import { getUser } from "./auth.middleware";

export async function classroomLocals(req: Request, res: Response, next: NextFunction) {
    // Get Community Info
    res.locals.community = {
        title: COMMUNITY_TITLE,
        link: COMMUNITY_LINK,
        url: COMMUNITY_BASE_URL,
        posts: await getCommunityTopics(),
    }

    // Get Chat info
    const chatStats = await getChatStatistics()

    res.locals.chat = {
        title: CHAT_TITLE,
        link: CHAT_LINK,
        json: CHAT_JSON,

        ...chatStats,
    }

    // Load Feedback for Neo4j Employees
    const user = await getUser(req)

    if (user && user.email.endsWith('@neotechnology.com')) {
        const { originalUrl } = req
        const parts = originalUrl.split('/').filter(n => n !== '')

        const type = parts.length === 3 ? FeedbackType.Module : FeedbackType.Lesson

        res.locals.feedbackScore = await getFeedback(type, originalUrl)

        console.log(res.locals.feedback);

    }

    next()
}