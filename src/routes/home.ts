import { Router } from 'express'
import { getCoursesByCategory } from '../domain/services/get-courses-by-category'
import { getUser } from '../middleware/auth'
// import { loadFile } from '../modules/asciidoc'
// import pug from 'pug'
// import path from 'path'

const router = Router()

router.get('/', async (req, res, next) => {
    try {
        const user = await getUser(req)

        // Get Courses
        const categories = await getCoursesByCategory(user)

        // const courseTemplate = path.join(__dirname, '..', '..', 'views', 'partials', 'courses-by-category.pug')
        // const compileCourses = pug.compileFile(courseTemplate)

        // const catalogue = compileCourses({
        //     categories,
        // })

        // Render Doc
        // const home = loadFile('pages/home.adoc', {
        //     attributes: {
        //         catalogue,
        //     }
        // })
        // const doc = home.getContent()


        // @ts-ignore
        // console.log(categories.find(category => category.slug === 'experience'));

        const beginners = categories.find(category => category.slug === 'experience')
            ?.children?.find(child => child.slug === 'beginners')

        const paths = categories.find(category => category.slug === 'paths')

        paths?.children?.sort((a, b) => a.title < b.title ? -1 : 1)

        const certification = categories.find(category => category.slug === 'certification')

        res.render('home', {
            title: 'Free, Self-Paced, Hands-on Online Training ',
            classes: 'home transparent-nav preload',
            categories,
            // doc,
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