import { Router } from 'express'
import { CourseWithProgress } from '../domain/model/course'
import { User } from '../domain/model/user'
import { getUserAchievements } from '../domain/services/get-user-achievements'
import { getUserEnrolments } from '../domain/services/get-user-enrolments'
import { getUser } from '../middleware/auth'
import { getUserName } from '../utils'

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
        const title = own ? 'My Achievements' : `${getUserName(user as User)}'s Achievements`

        // Sort Courses
        for ( const category of categories ) {
            category.courses.sort((a: CourseWithProgress, b: CourseWithProgress) => a.completed < b.completed ? 1 : -1)
        }

        if ( categories.length === 0 ) {
            const content = own ? `<p>This page acts as a public record of your achievements on GraphAcademy.</p><p>Every course that you complete will appear here so friends and colleagues can track your progress.</p>`
                : `This user hasn't completed any courses yet.  Please check back later.`;

            return res.render('simple', {
                hero: {
                    title,
                    overline: 'Neo4j GraphAcademy',
                },
                content,
                action: {
                    link: '/categories/',
                    text: 'View Course Catalogue'
                }
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

        const { user, enrolments } = await getUserEnrolments(req.params.id, 'id')

        const own = current?.id === req.params.id

        if (!enrolments) {
            return res.redirect(`/u/${req.params.id}`)
        }

        const course = enrolments.completed?.find(item => item.slug === req.params.course)


        if (!course || !course?.completed) {
            return res.redirect(`/u/${req.params.id}`)
        }

        console.log(course.badge);


        const title = [
            course.title,
            own ? 'My Achievements' : `${getUserName(user as User)}'s Achievements`
        ].join(' | ')

        res.render('profile/certificate', {
            title,
            course,
            name: getUserName(user as User),
            own,
        })
    }
    catch (e) {
        next(e)
    }
})

export default router
