import { Router } from 'express'
import { getUserEnrolments } from '../domain/services/get-user-enrolments'
import { getUser } from '../middleware/auth'
import { getUserName } from '../utils'

const router = Router()


router.get('/', (req, res) => {
    res.redirect('/')
})

router.get('/:id', async (req, res, next) => {
    const current = await getUser(req)

    const { user, enrolments } = await getUserEnrolments(req.params.id, 'id')

    const own = current?.id === req.params.id

    const title = own ? 'My Achievements' : `${getUserName(user)}'s Achievements`

    res.render('profile/achievements', {
        title,
        hero: {
            overline: 'Neo4j GraphAcademy',
            title,
        },
        ...user,
        enrolments,
        own,
    })
})

router.get('/:id/:course', async (req, res, next) => {
    const current = await getUser(req)

    const { user, enrolments } = await getUserEnrolments(req.params.id, 'id')

    const own = current?.id === req.params.id

    if ( !enrolments ) {
        return res.redirect(`/u/${req.params.id}`)
    }

    const course = enrolments.completed?.find(item => item.slug === req.params.course)


    if ( !course || !course?.completed ) {
        return res.redirect(`/u/${req.params.id}`)
    }

    const title = [
        course.title,
        own ? 'My Achievements' : `${getUserName(user)}'s Achievements`
    ].join(' | ')

    res.render('profile/achievement-view', {
        title,
        course,
        name: getUserName(user),
        own,
    })
})

export default router
