import path from 'path'
import fs from 'fs'
import { Request, Response, Router, static as serveStatic } from 'express'
import { requiresAuth } from 'express-openid-connect'
import { getUser } from '../middleware/auth.middleware'
import { User } from '../domain/model/user'

const router = Router()

const browserDist = path.join(__dirname, '..', '..', 'browser', 'dist')

router.get('/', requiresAuth(), async (req: Request, res: Response) => {
    const user = await getUser(req) as User
    const html = fs.readFileSync(path.join(browserDist, 'index.html')).toString()

    // Add User identifier
    res.send(html.replace('</body>', `\n<script>\nwindow.user = { sub: '${user.sub}' }\n</script>\n</body>`))
})
router.use('/', serveStatic(browserDist))

export default router
