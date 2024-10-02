import express from 'express'
import initNeo4j, { read } from './modules/neo4j'
import { loadFile } from './modules/asciidoc'
import { courseBadgePath, courseIllustrationPath, courseOverviewPath, courseSummaryPath } from './utils'
import { readFileSync } from 'fs'
import { join } from 'path'

const app = express()

import {
    NEO4J_HOST,
    NEO4J_USERNAME,
    NEO4J_PASSWORD,
} from './constants'

app.set('view engine', 'pug')

app.get('/', (req, res) => res.redirect('/neo4j-fundamentals'))

app.get('/:course', async (req, res) => {
    await initNeo4j(NEO4J_HOST as string, NEO4J_USERNAME as string, NEO4J_PASSWORD as string)

    const result = await read(`MATCH (c:Course {slug: $course}) RETURN c`, { course: req.params.course })
    if (!result.records.length) {
        return res.status(404).send('Not Found')
    }
    const [first] = result.records
    const course = first.get('c').properties

    const file = loadFile(courseOverviewPath(course.slug))

    const css = readFileSync(join(__dirname, '..', 'resources', 'css', 'banner.css'))

    let badge, illustration

    try {
        badge = readFileSync(courseBadgePath(course.slug)).toString()
    }
    catch (e: unknown) { }

    try {
        illustration = readFileSync(courseIllustrationPath(course.slug)).toString()
    }
    catch (e: unknown) { }

    res.render('banner', {
        overline: file.getAttribute('overline'),
        title: file.getTitle(),
        byline: file.getAttribute('caption'),
        bannerStyle: file.getAttribute('banner-style', 'dark'),
        badge,
        illustration,
        css,
    })
})

app.get('/:course/summary', async (req, res) => {
    const courseFile = loadFile(courseOverviewPath(req.params.course))
    const summaryFile = loadFile(courseSummaryPath(req.params.course))

    res.render('summary', {
        course: {
            title: courseFile.getTitle(),
        },
        title: summaryFile.getTitle(),
        byline: summaryFile.getAttribute('caption'),
        doc: summaryFile.getContent(),
        css: readFileSync(join(__dirname, '..', 'resources', 'css', 'summary.css'))
    })
})

export default app