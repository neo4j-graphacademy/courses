import { Router } from 'express'
import classmarkerRoutes from '../../modules/classmarker/routes/classmarker.routes'

const router = Router()

router.use('/classmarker', classmarkerRoutes)

export default router
