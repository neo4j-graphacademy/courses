import { Request, Response, NextFunction, Router } from 'express'
import { requiresAuth } from 'express-openid-connect'
import { User } from '../../../domain/model/user'
import { getCourseWithProgress } from '../../../domain/services/get-course-with-progress'
import NotFoundError from '../../../errors/not-found.error'
import { getToken, getUser } from '../../../middleware/auth.middleware'
import { getSandboxByHashKey, getSandboxes, getSandboxForUseCase } from '../../../modules/sandbox'

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

router.get('/usecase/:usecase', requiresAuth(), async (req: Request, res: Response, next: NextFunction) => {
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

router.get('/courses/:slug', requiresAuth(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = await getToken(req)
        const user = await getUser(req) as User
        const { slug } = req.params

        const course = await getCourseWithProgress(slug, user, token)

        if (!course) {
            return res.status(404)
        }
        else if (!course.usecase) {
            return res.status(404)
        }

        const sandbox = await getSandboxForUseCase(token, user, course.usecase)

        if (!sandbox) {
            throw new NotFoundError(`No sandbox for course ${course}, usecase: ${course.usecase}`)
        }

        res.json(sandbox)
    }
    catch (e) {
        next(e)
    }
})

router.get('/hash/:hash', requiresAuth(), async (req: Request, res: Response) => {
    try {
        const token = await getToken(req)
        const user = await getUser(req) as User
        const { hash } = req.params

        const { sandbox, status } = await getSandboxByHashKey(token, user, hash)

        res.json({
            ...sandbox,
            status,
        })
    }
    catch (e: any) {
        res.status(e.status || 500).json({
            message: e.status,
        })
    }
})

export default router
