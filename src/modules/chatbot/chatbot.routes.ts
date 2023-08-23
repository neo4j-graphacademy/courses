import { Router } from "express";
import { requiresAuth } from "express-openid-connect";
import { getUser } from "../../middleware/auth.middleware";
import getChatbot from "./chatbot.class";
import { notify } from "../../middleware/bugsnag.middleware";
import { User } from "../../domain/model/user";


const router = Router()

router.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: `<p>Hi, my name is <strong> E.L.A.I.N.E.</strong>, an <strong>Educational Learning Assistant for Intelligent Network Exploration</strong>. How can I help you today?`
    })
})

router.post('/:id/feedback', requiresAuth(), async (req, res) => {
    try {
        const user = await getUser(req) as User
        const { id } = req.params
        const { helpful, reason, additional } = req.body

        const chatbot = getChatbot()

        const saved = await chatbot?.recordFeedback(user, id, { helpful, reason, additional })

        if (saved) {
            res.status(201).json({
                status: 'ok',
            })
        }
        else {
            res.status(404).json({
                status: 'error',
            })
        }
    }
    catch (e: any) {
        notify(e)

        res.status(404).json({
            status: 'error',
        })
    }
})

export default router