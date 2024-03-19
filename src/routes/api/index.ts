import { Router } from 'express'
import classmarkerRoutes from '../../modules/classmarker/routes/classmarker.routes'
import courseRoutes from './courses/api-courses.routes'
import openAIProxyRoutes from '../../modules/openai-proxy/openai-api.routes'

const router = Router()

router.use('/classmarker', classmarkerRoutes)
router.use('/courses', courseRoutes)
router.use('/llm', openAIProxyRoutes)

export default router
