import path from 'path'
import { Router, static as serveStatic } from 'express'

const router = Router()

const browserDist = path.join(__dirname, '..', '..', 'browser', 'dist')

router.use('/', serveStatic(browserDist))

export default router
