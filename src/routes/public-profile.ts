import { Router } from 'express'
// import { getCourseWithProgress } from '../domain/services/get-course-with-progress'
// import { CourseWithProgress } from '../domain/model/course'
// import { Hero } from '../domain/model/hero'
// import { Pagination } from '../domain/model/pagination'
// import { User } from '../domain/model/user'
import { getUserEnrolments } from '../domain/services/get-user-enrolments'
import { getUser } from '../middleware/auth'
import { getUserName } from '../utils'

const router = Router()

// const breadcrumbs = (user: User, own: boolean, course?: CourseWithProgress): Pagination[] => {
//     const output = [
//         {
//             link: `/u/${user.id}`,
//             title: own ? 'My Achievements' : `${getUserName(user)}'s Achievements`
//         }
//     ]

//     if (course) {
//         output.push({
//             link: `/u/${user.id}/${course.slug}`,
//             title: course.title,
//         })
//     }

//     return output
// }

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
        // breadcrumbs: breadcrumbs(user, own),
    })
})

router.get('/:id/:course', async (req, res, next) => {
    const current = await getUser(req)

    const { user, enrolments } = await getUserEnrolments(req.params.id, 'id')

    const own = current?.id === req.params.id

    if ( !enrolments ) {
        return res.redirect(`/u/${req.params.id}`)
    }

    const course = enrolments.completed?.find(course => course.slug === req.params.course)


    if ( !course || !course?.completed ) {
        return res.redirect(`/u/${req.params.id}`)
    }

    const title = [
        course.title,
        own ? 'My Achievements' : `${getUserName(user)}'s Achievements`
    ].join(' | ')


    // res.json({progress, own, user})



    // const hero: Hero = {
    //     title: [
    //         own ? 'My Achievements' : `${getUserName(user)}'s Achievements`
    //     ],
    // }

    // const title =

    res.render('profile/achievement-view', {
        title: title,
        course,
        name: getUserName(user),
        own,
    })
})

export default router