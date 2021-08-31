import { Router } from 'express'
import { Category } from '../domain/model/category'
import { Course } from '../domain/model/course'

import { getCoursesByCategory } from '../domain/services/get-courses-by-category'
import NotFoundError from '../errors/not-found.error'
import { getUser } from '../middleware/auth'

const router = Router()

const flattenCategories = (categories: Category[]): Category[] => {
    return categories.reduce((acc: Category[], item: Category): Category[] => {
        const output: Category[] = [item].concat(...flattenCategories(item.children || []) || [])

        return acc.concat(...output)
    }, [])
}

/**
 * @GET /
 *
 * Display a list of available courses
 */
router.get('/', async (req, res, next) => {
    try {
        const user = await getUser(req)
        const categories = await getCoursesByCategory(user)

        // Flatten Category list
        const flattened: Category[] = flattenCategories(categories)

        // Unique Courses only
        const courses: Course[] = flattened.reduce((acc: Course[], category: Category) => {
            const these = (category.courses || []).filter(item => !acc.map(row => row.slug).includes(item.slug))

            return acc.concat(these)
        }, [])

        res.render('course/list', {
            title: 'All Courses',
            slug: false,
            categories,
            courses,
            hero: {
                title:'Free Neo4j Courses',
                byline: 'Hands-on training. No installation required.',
                overline: 'Neo4j GraphAcademy',
            }
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

        // Flatten Category list
        const flattened: Category[] = flattenCategories(categories)

        // Find Category by slug
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