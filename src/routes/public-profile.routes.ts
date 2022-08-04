import { Router } from 'express'
import { BASE_URL } from '../constants'
import { CourseWithProgress } from '../domain/model/course'
import { User } from '../domain/model/user'
import { getUserAchievements } from '../domain/services/get-user-achievements'
import { getUserEnrolments } from '../domain/services/get-user-enrolments'
import { getUser } from '../middleware/auth.middleware'
import { getUserName } from '../utils'
import { courseOgBannerImage } from './route.utils'

const router = Router()


/**
 * Redirect to home if no user ID is supplied
 */
router.get('/', (req, res) => {
    res.redirect('/')
})

/**
 * @GET /u/:id
 *
 * Show public profile for a user
 */
router.get('/:id', async (req, res, next) => {
    try {
        const current = await getUser(req)

        const { user, categories } = await getUserAchievements(req.params.id)

        const own = current?.id === req.params.id
        const title = own ? 'My Achievements' : `${getUserName(user)}'s Achievements`

        // Sort Courses
        for ( const category of categories ) {
            category.courses.sort((a: CourseWithProgress, b: CourseWithProgress) => {
                if ( a.completed && !b.completed ) {
                    return -1
                }
                if ( a.completed && !b.enrolled ) {
                    return -1
                }

                return a.title < b.title ? -1 : 1
            })
        }

        const breadcrumbs = [
            { link: '/', text: 'Neo4j GraphAcademy', },
            { link: req.originalUrl, text: title, },
        ]

        if ( categories.length === 0 ) {
            const content = own ? `<p>This page acts as a public record of your achievements on GraphAcademy.</p><p>Every course that you complete will appear here so friends and colleagues can track your progress.</p>`
                : `This user hasn't completed any courses yet.  Please check back later.`;

            return res.render('simple', {
                title,
                hero: {
                    title,
                    overline: 'Neo4j GraphAcademy',
                },
                breadcrumbs,
                content,
                action: {
                    link: '/categories/',
                    text: 'View Course Catalogue'
                },
            })
        }

        res.render('profile/achievements', {
            title,
            hero: {
                overline: 'Neo4j GraphAcademy',
                title,
            },
            ...user,
            own,
            categories,
            breadcrumbs
        })
    }
    catch (e) {
        next(e)
    }
})

/**
 * @GET /u/:id/:course
 *
 * Show a certificate for a user/course
 */
router.get('/:id/:course', async (req, res, next) => {
    try {
        const current = await getUser(req)

        const { user, enrolments } = await getUserEnrolments(req.params.id, 'id', false)

        const own = current?.id === req.params.id

        if (!enrolments) {
            return res.redirect(`/u/${req.params.id}`)
        }

        const course = enrolments.completed?.find(item => item.slug === req.params.course)

        if (!course || !course?.completed) {
            return res.redirect(`/u/${req.params.id}`)
        }

        const userName = getUserName(user as User)
        const title = [
            course.title,
            own ? 'My Achievements' : `${userName}'s Achievements`
        ].join(' | ')

        // OG Tags
        let ogTitle = ''
        let ogDescription = ''

        if ( course.completedAt ) {
            ogTitle = `${own ? 'I' : userName} earned the ${course.title} badge on #Neo4j #GraphAcademy`
            ogDescription = `On ${new Intl.DateTimeFormat('en-US', {dateStyle: 'medium'}).format( new Date(course.completedAt?.toString()) )} ${own ? 'I' : userName} earned the ${course.title} badge.  Test yourself with #Neo4j #GraphAcademy...`
        }
        else {
            ogTitle = `${own ? 'I am' : `${userName} is`} working towards the ${course.title} badge on #Neo4j #GraphAcademy`
            ogDescription = `${own ? 'I am' : userName + ' is'} working towards the ${course.title} badge.  Test yourself with #Neo4j #GraphAcademy...`
        }

        const ogImage = courseOgBannerImage(course.slug)

        // Year and month for LinkedIn
        const year = course.completedAt ? course.completedAt.getFullYear() : null
        const month = course.completedAt ? course.completedAt.getMonth() +1 : null
        const url = `${BASE_URL}/u/${req.params.id}/${req.params.course}/`

        res.render('profile/certificate', {
            title,
            course,
            name: getUserName(user as User),
            own,
            ogTitle,
            ogDescription,
            ogImage,
            year,
            month,
            url,
        })
    }
    catch (e) {
        next(e)
    }
})

export default router
