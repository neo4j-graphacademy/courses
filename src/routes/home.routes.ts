import { Router } from 'express'
import { ASCIIDOC_DIRECTORY, BASE_URL } from '../constants'
import { Course, LANGUAGE_EN, NEGATIVE_STATUSES } from '../domain/model/course'
import { getCoursesByCategory } from '../domain/services/get-courses-by-category'
import { getUserEnrolments } from '../domain/services/get-user-enrolments'
import { getUser } from '../middleware/auth.middleware'
import { translate } from '../modules/localisation'
import { read } from '../modules/neo4j'
import { canonical } from '../utils'
import path from 'path'
import { existsSync, readdirSync, readFileSync, statSync } from 'fs'

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

        const beginners = categories
            .find((category) => category.slug === 'experience')
            ?.children?.find((child) => child.slug === 'beginners')

        const paths = categories?.find((category) => category.slug === 'topic')

        // TODO: Reinstate these categories
        if (paths?.children) {
            paths.children = paths?.children.filter((category) => !['foundation'].includes(category.slug))
        }

        const certification = categories.find((category) => category.slug === 'certification')

        const activePath = 'generative-ai'

        const translateEn = translate(LANGUAGE_EN)

        res.render('home', {
            title: 'Free, Self-Paced, Hands-on Online Training ',
            description: 'Learn how to build, optimize and launch your Neo4j project, all from the Neo4j experts.',
            classes: 'transparent-nav preload',
            canonical: canonical('/'),
            categories,
            beginners,
            paths,
            certification,
            activePath,
            meta: [
                {
                    name: 'apple-itunes-app',
                    content: 'app-id=1557747094',
                },
            ],
            // banner: {
            //     text: 'Call for Papers now Open for Nodes 2025',
            //     link: 'https://sessionize.com/nodes-2025/',
            //     cta: 'Submit your talk',
            // },
            translate: translateEn,
        })
    } catch (e) {
        next(e)
    }
})

/**
 * Landing page for Knowledge Graphs & Graph RAG
 */
router.get('/knowledge-graph-rag', async (req, res) => {
    const user = await getUser(req)
    const categories = await getCoursesByCategory(user)

    const allCourses: Record<string, Course> = {}

    for (const category of categories) {
        if (category.children) {
            for (const child of category.children) {
                if (child.courses) {
                    for (const course of child.courses) {
                        allCourses[course.slug] = course
                    }
                }
            }
        }
    }

    res.render('pages/knowledge-graph-rag', {
        title: 'Knowledge Graph and GraphRAG courses on GraphAcademy',
        description:
            'Learn everything you need to know to combine Generative AI and knowledge graphs to produce highly accurate responses, with rich context and deep explainability.',
        classes: 'graphrag transparent-nav preload',
        courses: allCourses,
        link: '/knowledge-graph-rag/',
        links: [
            {
                href: 'https://fonts.googleapis.com/css2?family=Amatic+SC:wght@400;700&display=swap',
                rel: 'stylesheet',
            },
        ],
    })
})

/**
 * Generate sitemap
 */
router.get('/sitemap.txt', async (req, res, next) => {
    try {
        const result = await read<{ link: string }>(
            `
            MATCH (c:Course)-[:HAS_MODULE]->(m)-[:HAS_LESSON]->(l)
            WHERE NOT c.status IN $negative + ['redirect']
            UNWIND [ c.link, m.link, l.link  ] AS link
            RETURN distinct link
            UNION ALL MATCH (c:Category) RETURN '/categories/'+ c.slug AS link
            UNION ALL MATCH (c:Certification) RETURN c.link AS link
        `,
            { negative: NEGATIVE_STATUSES }
        )

        const links = result.records
            .filter((row) => row.get('link') !== null)
            .map((row) => `${BASE_URL}${row.get('link')}`)

        links.push(`${BASE_URL}/certifications/`)
        links.push(`${BASE_URL}/knowledge-graph-rag/`)

        res.send(links.join('\n'))
    } catch (e) {
        next(e)
    }
})

/**
 * @GET /llms.txt
 *
 * Send the llms.txt file
 */
router.get('/llms.txt', async (req, res) => {
    const coursesDirectory = path.join(ASCIIDOC_DIRECTORY, 'courses')

    // Courses
    let output = ['# Neo4j GraphAcademy', '', '## Courses', '']

    for (const folder of readdirSync(coursesDirectory)) {
        if (
            statSync(path.join(coursesDirectory, folder)).isDirectory() &&
            existsSync(path.join(coursesDirectory, folder, 'llms.txt'))
        ) {
            // open file and read first line
            const file = readFileSync(path.join(coursesDirectory, folder, 'llms.txt'), 'utf8')
            const firstLine = file.split('\n')[0].replace('# ', '')

            const link = canonical(`/courses/${folder}/llms.txt`)

            output.push(`- [${firstLine}](${link})`)
        }
    }

    output.push('')
    output.push('')
    output.push('## Categories')
    output.push('')

    const ca = canonical('/')

    // Categories
    const result = await read<{
        title: string
        slug: string
        caption: string
        children: { title: string; slug: string; caption: string }[]
    }>(`
        MATCH (c:Category)-[:HAS_CHILD]->(child:Category)
        WHERE COUNT { (child)<-[:IN_CATEGORY]-({status: 'active'}) } > 0
        WITH c, child 
        ORDER BY c.title, child.title
        RETURN c.title AS title, 
            c.slug AS slug, 
            c.caption AS caption, 
            collect(child { .title, .slug, .caption }) AS children
    `)

    for (const row of result.records) {
        output.push(`### ${row.get('title')}`)
        output.push('')

        for (const child of row.get('children')) {
            const link = canonical(`/categories/${child.slug}/llms.txt`)
            const caption = child.caption ? `- ${child.caption.replace(/<[^>]*>?/g, '')}` : ''
            output.push(`- [${child.title}](${link}) ${caption}`)
        }
        output.push('')
        output.push('')
    }

    output.push('')

    res.header('Content-Type', 'text/plain').send(output.join('\n'))
})

export default router
