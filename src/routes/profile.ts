import { Router } from 'express'
import { getToken, getUser } from '../middleware/auth'
import { getSandboxes } from '../modules/sandbox'

const router = Router()

// TODO: Remove
router.get('/', async (req, res, next) => {
    const user = await getUser(req)

    res.json(user)
})

router.get('/sandboxes', async (req, res, next) => {
    const token = await getToken(req)

    getSandboxes(token)
        .then(json => res.json(json))
        .catch(e => next(e))
})

export default router