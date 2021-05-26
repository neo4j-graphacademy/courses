import { Router } from 'express'
import { CourseWithProgress } from '../domain/model/course'
import { Pagination } from '../domain/model/pagination'
import { User } from '../domain/model/user'
import { getCourseWithProgress } from '../domain/services/get-course-with-progress'
import { getUserEnrolments } from '../domain/services/get-user-enrolments'
import { getUser } from '../middleware/auth'

const router = Router()

const breadcrumbs = (user: Partial<User>, own: boolean, course?: CourseWithProgress): Pagination[] => {
    const output = [
        {
            link: `/u/${user.id}`,
            text: own ? 'My Achievements' : `${user.name}'s Achievements`
        }
    ]

    if (course) {
        output.push({
            link: `/u/${user.id}/${course.slug}`,
            text: course.title,
        })
    }

    return output
}

router.get('/:id', async (req, res, next) => {
    const current = await getUser(req)

    const { user, enrolments } = await getUserEnrolments(req.params.id)

    const own = current?.id === req.params.id

    res.render('profile/achievements', {
        ...user,
        enrolments,
        own,
        breadcrumbs: breadcrumbs(user, own),
    })
})

router.get('/:id/:course', async (req, res, next) => {
    const current = await getUser(req)

    const { user, enrolments } = await getUserEnrolments(req.params.id)

    const course = await getCourseWithProgress(req.params.course)

    const progress = enrolments.completed?.find(course => course.slug === req.params.course)
    const { enrolled, completed } = progress || {}

    if ( !completed ) {
        return res.redirect(`/u/${req.params.id}`)
    }

    const own = current?.id === req.params.id

    res.render('profile/achievement-view', {
        enrolled,
        completed,
        progress,
        own,
        course,
        ...user,
        breadcrumbs: breadcrumbs(user, own, course)
    })
})

export default router