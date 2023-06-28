import { Router } from 'express'
import { CourseWithProgress } from '../domain/model/course'
import { getUserAchievements } from '../domain/services/get-user-achievements'
import { getUserEnrolments } from '../domain/services/get-user-enrolments'
import { getUser } from '../middleware/auth.middleware'
import { getCountries, getUserName } from '../utils'

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
        for (const category of categories) {
            category.courses.sort((a: CourseWithProgress, b: CourseWithProgress) => {
                if (a.completed && !b.completed) {
                    return -1
                }
                if (a.completed && !b.enrolled) {
                    return -1
                }

                return a.title < b.title ? -1 : 1
            })
        }

        const breadcrumbs: Record<string, any>[] = [
            { link: '/', text: 'Neo4j GraphAcademy', },
            { link: req.originalUrl, text: title, },
        ]

        if (categories.length === 0) {
            const content = own ? `<p>This page acts as a public record of your achievements on GraphAcademy.</p><p>Every course that you complete will appear here so friends and colleagues can track your progress.</p>`
                : `This user hasn't completed any courses yet.  Please check back later.`;

            return res.render('simple', {
                title,
                breadcrumbs,
                content,
                action: {
                    link: '/categories/',
                    text: 'View all courses'
                },
            })
        }

        res.render('profile/achievements', {
            classes: 'public-profile',
            title,
            countries: await getCountries(),
            user,
            own,
            categories,
            breadcrumbs,
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
        const { enrolments } = await getUserEnrolments(req.params.id, 'id', false)

        if (!enrolments) {
            return res.redirect(`/u/${req.params.id}`)
        }

        const course = enrolments.completed?.find(item => item.slug === req.params.course)

        if (!course || !course?.completed) {
            return res.redirect(`/u/${req.params.id}`)
        }

        return res.redirect(`/c/${course.certificateId}`)
    }
    catch (e) {
        next(e)
    }
})

export default router
