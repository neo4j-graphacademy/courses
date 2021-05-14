import { Router } from 'express'
import { getToken, getUser } from '../middleware/auth'
import { getSandboxes } from '../modules/sandbox'

const router = Router()

router.get('/', (req, res, next) => {
    const user = getUser(req)

    res.json(user)
})

router.get('/sandboxes', (req, res, next) => {
    const token = getToken(req)

    getSandboxes(token)
        .then(json => res.json(json))
})

export default router