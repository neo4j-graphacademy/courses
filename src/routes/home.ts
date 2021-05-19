import { Router } from 'express'
import { getCoursesByCategory } from '../domain/services/get-courses-by-category'

const router = Router()

router.get('/', (req, res, next) => {
    getCoursesByCategory()
        .then(categories => res.render('home', { categories }))
        .catch(e => next(e))
})

export default router