import { Router } from 'express'
import { BASE_URL } from '../constants'
import { Course, CourseWithProgress, LANGUAGE_EN, NEGATIVE_STATUSES } from '../domain/model/course'
import { getCoursesByCategory } from '../domain/services/get-courses-by-category'
import { getUserEnrolments } from '../domain/services/get-user-enrolments'
import { getUser } from '../middleware/auth.middleware'
import { translate } from '../modules/localisation'
import { read } from '../modules/neo4j'
import { canonical } from '../utils'
import { STATUS_BOOKMARKED, STATUS_ENROLLED, STATUS_RECENTLY_COMPLETED } from '../domain/model/enrolment'
import { Category } from '../domain/model/category'

const router = Router()

/**
 * Display homepage
 */
router.get('/', async (req, res, next) => {
    try {
        const user = await getUser(req)

        // Redirect user to dashboard
        if (user && !req.query.redirect?.toString().toLowerCase().includes('off')) {
            const output = await getUserEnrolments(user.sub)
            if ((output?.enrolments?.enrolled?.length || 0) > 0 || (output?.enrolments?.completed?.length || 0) > 0) {
                return res.redirect('/account/')
            }
        }

        // Get Courses
        const categories = await getCoursesByCategory(user)


        const beginners = categories.find(category => category.slug === 'experience')
            ?.children?.find(child => child.slug === 'beginners')

        const paths = categories?.find(category => category.slug === 'topic')

        // TODO: Reinstate these categories
        if (paths?.children) {
            paths.children = paths?.children.filter(category => !['foundation'].includes(category.slug))
        }

        const certification = categories.find(category => category.slug === 'certification')

        const activePath = 'generative-ai'

        const translateEn = translate(LANGUAGE_EN)

        res.render('home', {
            title: 'Free, Self-Paced, Hands-on Online Training ',
            description: 'Learn how to build, optimize and launch your Neo4j project, all from the Neo4j experts.',
            classes: 'home transparent-nav preload',
            canonical: canonical('/'),
            categories,
            beginners,
            paths,
            certification,
            activePath,
            meta: [{
                name: 'apple-itunes-app', content: 'app-id=1557747094'
            }],
            // banner: {
            //     text: 'Help us improve your experience on GraphAcademy  - ',
            //     link: 'https://forms.gle/PbXHbFPYvBKvnqE59',
            //     cta: 'Complete the survey',
            // },
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
        const result = await read<{ link: string }>(`
            MATCH (c:Course)-[:HAS_MODULE]->(m)-[:HAS_LESSON]->(l)
            WHERE NOT c.status IN $negative + ['redirect']
            UNWIND [ c.link, m.link, l.link  ] AS link
            RETURN distinct link
            UNION ALL MATCH (c:Category) RETURN '/categories/'+ c.slug AS link
            UNION ALL MATCH (c:Certification) RETURN c.link AS link
        `, { negative: NEGATIVE_STATUSES })

        const links = result.records
            .filter(row => row.get('link') !== null)
            .map(row => `${BASE_URL}${row.get('link')}`)


        links.push(`${BASE_URL}/certifications/`)

        res.send(links.join('\n'))
    }
    catch (e) {
        next(e)
    }
})

export default router
