import { Router } from 'express'
import classmarkerRoutes from '../../modules/classmarker/routes/classmarker.routes'
import courseRoutes from './courses/api-courses.routes'

const router = Router()

router.use('/classmarker', classmarkerRoutes)
router.use('/courses', courseRoutes)

export default router
