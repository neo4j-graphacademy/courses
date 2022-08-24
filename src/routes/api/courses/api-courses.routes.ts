import { Request, Response, NextFunction, Router } from 'express'
import { getCoursesByCategory } from '../../../domain/services/get-courses-by-category'

const router = Router()

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courses = await getCoursesByCategory()

        res.json(courses)
    }
    catch (e) {
        next(e)
    }
})

export default router
