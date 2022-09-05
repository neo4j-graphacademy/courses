import { Router } from 'express'
import classmarkerRoutes from '../../modules/classmarker/routes/classmarker.routes'
import courseRoutes from './courses/api-courses.routes'
import sandboxRoutes from './sandbox/api-sandbox.routes'

const router = Router()

router.use('/classmarker', classmarkerRoutes)
router.use('/courses', courseRoutes)
router.use('/sandboxes', sandboxRoutes)

export default router
