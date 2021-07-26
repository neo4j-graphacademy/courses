import { Router } from 'express'
import { Category } from '../domain/model/category'

import { getCoursesByCategory } from '../domain/services/get-courses-by-category'
import NotFoundError from '../errors/not-found.error'
import { getUser } from '../middleware/auth'

const router = Router()

/**
 * @GET /
 *
 * Display a list of available courses
 */
router.get('/', async (req, res, next) => {
    try {
        const user = await getUser(req)
        const categories = await getCoursesByCategory(user)

        const courses = categories.reduce(
            (acc, category: Category) => acc.concat(
                // @ts-ignore
                (category.children || []).reduce((innerAcc, child) => innerAcc.concat(child?.courses || [])
                    , [])),
            [])

        res.render('course/list', {
            title: 'All Courses',
            slug: false,
            categories,
            courses,
            heroTitle: 'Free Neo4j Courses',
            heroByline: 'Hands-on training. No installation required.',
            heroOverline: 'Neo4j GraphAcademy',
        })
    }
    catch (e) {
        next(e)
    }
})

router.get('/:slug', async (req, res, next) => {
    try {
        const { slug } = req.params
        const user = await getUser(req)
        const categories = await getCoursesByCategory(user)

        const flattened = categories.reduce((acc: Category[], item: Category) => {
            let output = [item]

            if (item.children) {
                output = output.concat(...item.children)
            }

            return acc.concat(output)
        }, [])

        const category = flattened.find(item => item.slug === slug)

        if (!category) {
            return next(new NotFoundError(`Category with slug ${slug} could not be found`))
        }

        res.render('course/list', {
            title: slug === 'certification' ? 'Neo4j Certifications' : `${category.title} Courses`,
            slug,
            categories,
            category,
            hero: {
                overline: 'Neo4j GraphAcademy',
                title: slug === 'certification' ? `Free Neo4j Certifications` : `Free Neo4j ${category.title} Courses`,
                byline: category.caption || 'Hands-on training. No installation required.',
            },
            courses: category.courses
        })
    }
    catch (e) {
        next(e)
    }
})

export default router