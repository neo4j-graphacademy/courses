import { Router } from 'express'
import { CourseWithProgress } from '../domain/model/course'
import { getCoursesByCategory } from '../domain/services/get-courses-by-category'
import { getUserEnrolments } from '../domain/services/get-user-enrolments'
import { getUser } from '../middleware/auth'

const router = Router()

router.get('/',  async (req, res, next) => {
    try {
        const user = await getUser(req)

        // Get Courses
        const categories = await getCoursesByCategory(user)

        // let enrolled: CourseWithProgress[] = []

        // if ( user ) {
        //     const output = await getUserEnrolments(user.sub)
        //     enrolled = output.enrolments.enrolled || []

        //     console.log(enrolled);

        // }



        const beginners = categories.find(category => category.slug === 'experience')
            ?.children?.find(child => child.slug === 'beginners')

        const paths = categories.find(category => category.slug === 'paths')

        paths?.children?.sort((a, b) => a.title < b.title ? -1 : 1)

        const certification = categories.find(category => category.slug === 'certification')

        res.render('home', {
            title: 'Free, Self-Paced, Hands-on Online Training ',
            hero: {
                title: 'Free, Self-Paced, Hands-on Online Training',
                byline: 'Learn how to build, optimize and launch your Neo4j project, all from the Neo4j experts.',
                overline: 'Learn with GraphAcademy'
            },
            description: 'Learn how to build, optimize and launch your Neo4j project, all from the Neo4j experts.',
            classes: 'home transparent-nav preload',
            categories,
            beginners,
            paths,
            certification,
        })
    }
    catch (e) {
        next(e)
    }
})

export default router