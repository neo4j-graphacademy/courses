import { Request, Response, NextFunction, Router } from 'express'
import { requiresAuth } from 'express-openid-connect'
import { User } from '../../../domain/model/user'
import { getToken, getUser } from '../../../middleware/auth.middleware'
import { getSandboxes, getSandboxForUseCase } from '../../../modules/sandbox'

const router = Router()

router.get('/', requiresAuth(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = await getToken(req)
        const user = await getUser(req) as User

        const sandboxes = await getSandboxes(token, user)

        res.json(sandboxes)
    }
    catch (e) {
        next(e)
    }
})

router.get('/:usecase', requiresAuth(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = await getToken(req)
        const user = await getUser(req) as User
        const { usecase } = req.params

        const sandbox = await getSandboxForUseCase(token, user, usecase)

        res.json(sandbox)
    }
    catch (e) {
        next(e)
    }
})

export default router
