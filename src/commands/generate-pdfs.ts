import { existsSync, readdirSync, statSync, writeFileSync } from "fs"
import { COURSE_DIRECTORY } from "../constants"
import { join } from "path";
import puppeteer from 'puppeteer'

import app from '../app'

const main = async () => {
    const courses = readdirSync(COURSE_DIRECTORY)
        // Check if it's a directory
        .filter(slug => {
            const stats = statSync(join(COURSE_DIRECTORY, slug))
            return stats.isDirectory()
        })
        // Check that summary.adoc exists in folder
        .filter(slug => existsSync(join(COURSE_DIRECTORY, slug, 'summary.adoc')))
        .filter(slug => !existsSync(join(COURSE_DIRECTORY, slug, 'summary.pdf')))
        // TODO: Only neo4j-fundamentals has been prepared
        .filter(slug => slug == 'neo4j-fundamentals')

    const browser = await puppeteer.launch({ headless: 'new' })

    for (const course of courses) {
        const page = await browser.newPage()
        await page.goto(`http://localhost:3001/${course}/summary`, { waitUntil: 'networkidle0' })
        const pdf = await page.pdf({ format: 'A4', landscape: true })

        // write pdf to file system
        await writeFileSync(
            join(COURSE_DIRECTORY, course, 'summary.pdf'),
            pdf,
            {}
        )
    }

    console.log(`📖 ${courses.length} Summary PDFs generated`)
}

const server = app.listen(3001, async () => {
    await main()

    server.close()
})
