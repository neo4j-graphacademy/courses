import path from 'path'
import fs from 'fs'
import { Request, Response, NextFunction, Router } from 'express'
import { CDN_URL, PUBLIC_DIRECTORY } from '../constants'
import { Category } from '../domain/model/category'
import { CourseWithProgress } from '../domain/model/course'
import { getCoursesByCategory } from '../domain/services/get-courses-by-category'
import NotFoundError from '../errors/not-found.error'
import { getUser } from '../middleware/auth.middleware'

import { canonical, categoryBannerPath, flattenCategories, groupCoursesByStatus } from '../utils'
import { forceTrailingSlash } from '../middleware/trailing-slash.middleware'

const router = Router()

/**
 * Course Breadcrumbs
 */
router.use((req, res, next) => {
    res.locals.breadcrumbs = [
        {
            link: '/',
            text: 'Neo4j GraphAcademy',
        },
        {
            link: '/categories/',
            text: 'All Courses',
        },
    ]

    next()
})

/**
 * @GET /
 *
 * Display a list of available courses
 */
router.get('/', forceTrailingSlash, async (req, res, next) => {
    try {
        const term: string | undefined = req.query.search as string | undefined
        const user = await getUser(req)
        const categories = await getCoursesByCategory<CourseWithProgress>(user, term)

        // Flatten Category list
        const flattened: Category<CourseWithProgress>[] = flattenCategories(categories)

        // Unique Courses only
        const courses: CourseWithProgress[] = flattened.reduce((acc: CourseWithProgress[], category: Category<CourseWithProgress>) => {
            const these = (category.courses || []).filter(item => !acc.map(row => row.slug).includes(item.slug))

            return acc.concat(these)
        }, [])

        // Group by status
        const grouped = groupCoursesByStatus(courses)

        const hasResults = flattened.some(category => category.courses?.filter(course => course.display).length)

        res.render('course/list', {
            title: 'All Courses',
            slug: false,
            classes: 'category',
            categories,
            courses,
            grouped,
            hero: {
                title: 'Free Neo4j Courses',
                byline: 'Hands-on training. No installation required.',
                // overline: 'Neo4j GraphAcademy',
            },
            term,
            hasResults,
            canonical: canonical(req.originalUrl),
            description: 'Hands-on training. No installation required.',
            ogImage: `${CDN_URL}/img/og/og-categories.png`,
            ogTitle: 'Free Neo4j Courses from GraphAcademy',
        })
    }
    catch (e) {
        next(e)
    }
})

router.get('/banner', (req: Request, res: Response) => {
    const filePath = path.join(PUBLIC_DIRECTORY, 'img', 'og', `og-categories.png`)

    res.header('Content-Type', 'image/png')

    res.sendFile(filePath)
})

router.get('/:slug', forceTrailingSlash, async (req, res, next) => {
    try {
        const { slug } = req.params
        const term: string | undefined = req.query.search as string | undefined
        const user = await getUser(req)
        const categories = await getCoursesByCategory(user, term)

        // Flatten Category list
        const flattened: Category<any>[] = flattenCategories(categories)

        // Find Category by slug
        const category = flattened.find(item => item.slug === slug)

        if (!category) {
            return res.redirect(301, '/categories/')
            return next(new NotFoundError(`Category with slug ${slug} could not be found`))
        }

        // Group by status
        const grouped = groupCoursesByStatus(category.courses || [])

        const hasResults = flattened.some(category => category.courses?.filter(course => course.display).length)

        // Add Breadcrumb
        res.locals.breadcrumbs.push({
            link: `/categories/${category.slug}/`,
            text: category.title,
        })

        res.render('course/list', {
            title: slug === 'certification' ? 'Neo4j Certifications' : `${category.title} Courses`,
            canonical: canonical(`/categories/${slug}/`),
            slug,
            categories,
            category,
            classes: 'category',
            hero: {
                // overline: 'Neo4j GraphAcademy',
                title: slug === 'certification' ? `Free Neo4j Certifications` : `Free ${category.title.startsWith('Neo4j') ? '' : 'Neo4j'} ${category.title} Courses`,
                byline: category.caption || 'Hands-on training. No installation required.',
            },
            courses: category.courses,
            grouped,
            hasResults,
            ogTitle: slug === 'certification' ? `Free Neo4j Certifications from GraphAcademy` : `Free ${category.title.startsWith('Neo4j') ? '' : 'Neo4j'} ${category.title} Courses from GraphAcademy`,
            ogDescription: category.caption || 'Hands-on training. No installation required.',
            ogImage: CDN_URL ? `${CDN_URL}/img/categories/banners/${category.slug}.png` : `/categories/${slug}/banner`
        })
    }
    catch (e) {
        next(e)
    }
})


router.get('/:slug/banner', (req: Request, res: Response, next: NextFunction) => {
    try {
        // TODO: Caching, save to S3
        const filePath = categoryBannerPath({ slug: req.params.slug } as Category<any>)

        if (!fs.existsSync(filePath)) {
            return next(new NotFoundError(`Banner not found for ${req.params.slug}`))
        }

        res.header('Content-Type', 'image/png')

        res.sendFile(filePath)
    }
    catch (e) {
        next(e)
    }

})

export default router
