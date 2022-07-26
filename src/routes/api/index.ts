import { Router } from 'express'
import classmarkerRoutes from './classmarker/classmarker.routes'

const router = Router()

router.use('/classmarker', classmarkerRoutes)

export default router
