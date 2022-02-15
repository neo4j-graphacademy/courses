import path from 'path'
import fs from 'fs'
import pug from 'pug'
import nodeHtmlToImage from 'node-html-to-image'

import dotenv from 'dotenv'
import initNeo4j, { read, close } from '../modules/neo4j';
import { categoryBannerPath, courseBannerPath, formatCourse, getSvgs } from '../utils';
import { courseCypher } from '../domain/services/cypher'
import { Course, NEGATIVE_STATUSES } from '../domain/model/course'
import { Category } from '../domain/model/category'

dotenv.config()

/* tslint:disable-next-line */
// console.clear();

const {
    NEO4J_HOST,
    NEO4J_USERNAME,
    NEO4J_PASSWORD
} = process.env


const svg = getSvgs()

const main = async () => {
    await initNeo4j(NEO4J_HOST as string, NEO4J_USERNAME as string, NEO4J_PASSWORD as string)

    // await render(path.join(PUBLIC_DIRECTORY, 'img', 'og', `og-categories.png`), 'Neo4j GraphAcademy', 'Free, Hands-on training.  No installation required.', 'Learn everything you need to know about Neo4j from the experts.')

    await renderCourses()
    await renderCategories()

    await close()
}

const renderCourses = async () => {
    const res = await read(`MATCH (c:Course) WHERE NOT c.status IN $exclude RETURN ${courseCypher()}`, { exclude: NEGATIVE_STATUSES })

    const courses = await Promise.all(
        res.records
            // .filter(row => !fs.existsSync( bannerPath(row.get('c')) ))
            .map(async row => await formatCourse( row.get('c') ))
    )

    while (courses.length) {
        const course: Course = courses.pop()!
        const bannerPath = courseBannerPath(course)

        if ( !fs.existsSync(bannerPath)  ) {
            await render(bannerPath, course.categories[0].title, course.title, course.caption, course.badge)

            // tslint:disable-next-line
            console.log(courseBannerPath(course));
        }
    }
}

const renderCategories = async () => {
    const res = await read(`MATCH (c:Category) RETURN c`)

    const categories = res.records.map(row => row.get('c').properties)

    while (categories.length) {
        const category: Category<any> = categories.pop()!
        await render(
            categoryBannerPath(category),
            'Neo4j GraphAcademy',
            category.title,
            category.caption || 'Hands-on training. No installation required.'
        )

        // tslint:disable-next-line
        console.log(categoryBannerPath(category));
    }
}


export async function render(outputTo: string, overline: string | undefined, title: string, byline: string, badge?: string) {
    const bannerFunction = pug.compileFile(path.join(__dirname, '..', '..', 'views', 'layouts', 'banner.pug'))
    const css = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'css', 'app.css'))

    const html = bannerFunction({
        overline,
        title,
        byline,
        badge,
        css,
        svg,
    })

    const output = await nodeHtmlToImage({
        output: outputTo,
        type: 'png',
        html,
    })

    return output.toString()
}

main()
