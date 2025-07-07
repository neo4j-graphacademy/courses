import { Router, Express } from "express";
import { requiresAuth } from "express-openid-connect";
import { getUser } from "../../middleware/auth.middleware";
import { notify } from "../../middleware/bugsnag.middleware";
import { User } from "../../domain/model/user";
import { getChatbotDriver } from "./chatbot.driver";
import { CHATBOT_NEO4J_DATABASE, CHATBOT_NEO4J_HOST, CHATBOT_NEO4J_PASSWORD, CHATBOT_NEO4J_USERNAME } from "../../constants";
import { invoke } from "./chatbot.agent";
import provideFeedback from "./services/provide-feedback";

const router = Router()

/**
 * If the chatbot is not configured, return a 404 error.
 */
router.use((req_, res, next) => {
    if (!CHATBOT_NEO4J_HOST || !CHATBOT_NEO4J_USERNAME || !CHATBOT_NEO4J_PASSWORD) {
        return res.status(404).json({
            status: 'error',
            message: 'Chatbot not configured'
        })
    }

    next()
})

/**
 * Status route
 */
router.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: `<p>Hi, my name is <strong> E.L.A.I.N.E.</strong>, an <strong>Educational Learning Assistant for Intelligent Network Exploration</strong>. How can I help you today?`
    })
})

/**
 * Provide feedback for a message
 */
router.post('/:id/feedback', async (req, res) => {
    try {
        const user = await getUser(req) as User
        const { id } = req.params
        const { helpful, reason = null, additional = null } = req.body

        const result = await provideFeedback(user, id, helpful, reason, additional);

        if (result.errors) {
            if (result.errors.message) {
                return res.status(404).json({
                    status: 'error',
                    message: result.errors.message
                });
            }
            
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: result.errors
            });
        }

        res.status(204).json({
            status: 'ok',
            message: 'Feedback received successfully'
        });
    }
    catch (e: any) {
        notify(e)

        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        })
    }
})

export default router
