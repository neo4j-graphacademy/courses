import { Router } from 'express'
import { getCourses } from '../domain/services/get-courses.service'

const router = Router()

router.get('/', (req, res, next) => {
    getCourses()
        .then(courses => res.render('home', { courses }))
        .catch(e => next(e))
})

export default router