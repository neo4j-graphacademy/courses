import fs from 'fs'
import { Router } from 'express'
import { getCoursesByCategory } from '../domain/services/get-courses-by-category'
import { loadFile } from '../modules/asciidoc'
import pug from 'pug'
import path from 'path'

const router = Router()

router.get('/', async (req, res, next) => {
    try {
        // Get Courses
        const categories = await getCoursesByCategory()

        const courseTemplate = path.join(__dirname, '..', '..', 'views', 'partials', 'courses-by-category.pug')
        const compileCourses = pug.compileFile(courseTemplate)

        const catalogue = compileCourses({
            categories,
        })

        const graphSvg = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'img', 'home', 'home-graph.svg'))

        // Render Doc
        const home = loadFile('pages/home.adoc', {
            attributes: {
                catalogue,
            }
        })

        const doc = home.getContent()

        res.render('home', {
            title: 'Free, Self-Paced, Hands-on Online Training ',
            classes: 'home transparent-nav preload',
            doc,
            graphSvg,
        })
    }
    catch (e) {
        next(e)
    }
})

export default router