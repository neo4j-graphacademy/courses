import { Router } from 'express'
import { BASE_URL } from '../constants'
import { CourseWithProgress, LANGUAGE_EN, NEGATIVE_STATUSES } from '../domain/model/course'
import { getCoursesByCategory } from '../domain/services/get-courses-by-category'
import { getUserEnrolments } from '../domain/services/get-user-enrolments'
import { getUser } from '../middleware/auth.middleware'
import { translate } from '../modules/localisation'
import { read } from '../modules/neo4j'
import { canonical } from '../utils'

const router = Router()

/**
 * Display homepage
 */
router.get('/', async (req, res, next) => {
    try {
        const user = await getUser(req)

        // Get Courses
        const categories = await getCoursesByCategory(user)

        // Get current courses
        let current: CourseWithProgress[] = []

        if (user) {
            try {
                const output = await getUserEnrolments(user.sub)
                current = output.enrolments.enrolled || []

                current.sort((a, b) => a.lastSeenAt && b.lastSeenAt && a.lastSeenAt > b.lastSeenAt ? -1 : 1)
            }
            catch (e) {
                current = []
            }
        }

        const beginners = categories.find(category => category.slug === 'experience')
            ?.children?.find(child => child.slug === 'beginners')

        const paths = categories?.find(category => category.slug === 'paths')

        // TODO: Reinstate these categories
        if (paths?.children) {
            paths.children = paths?.children.filter(category => !['aura', 'administrator', 'analyst'].includes(category.slug))
        }

        const certification = categories.find(category => category.slug === 'certification')

        const activePath = 'llms'

        const translateEn = translate(LANGUAGE_EN)

        res.render('home', {
            title: 'Free, Self-Paced, Hands-on Online Training ',
            description: 'Learn how to build, optimize and launch your Neo4j project, all from the Neo4j experts.',
            classes: 'home transparent-nav preload',
            canonical: canonical('/'),
            current,
            categories,
            beginners,
            paths,
            certification,
            activePath,
            meta: [{
                name: 'apple-itunes-app', content: 'app-id=1557747094'
            }],
            banner: {
                text: 'Learn how to use Neo4j with Large Language Models - ',
                link: '/courses/llm-fundamentals/?ref=banner',
                cta: 'Enroll now',
            },
            translate: translateEn,
        })
    }
    catch (e) {
        next(e)
    }
})


/**
 * Generate sitemap
 */
router.get('/sitemap.txt', async (req, res, next) => {
    try {
        const result = await read(`
            MATCH (c:Course)-[:HAS_MODULE]->(m)-[:HAS_LESSON]->(l)
            WHERE NOT c.status IN $negative + ['redirect']
            UNWIND [ c.link, m.link, l.link  ] AS link
            RETURN distinct link
            UNION ALL MATCH (c:Category) RETURN '/categories/'+ c.slug AS link
        `, { negative: NEGATIVE_STATUSES })

        const links = result.records
            .filter(row => row.get('link') !== null)
            .map(row => `${BASE_URL}${row.get('link')}`)
            .join('\n')

        res.send(links)
    }
    catch (e) {
        next(e)
    }
})

export default router
