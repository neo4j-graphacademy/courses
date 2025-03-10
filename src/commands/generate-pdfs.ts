import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "fs"
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
        .filter(slug => {
            const path = join(COURSE_DIRECTORY, slug, 'summary.adoc')
            const exists = existsSync(path)

            const hasPdf = exists && readFileSync(path).toString().includes(':pdf-summary:')

            return hasPdf
        })
        .filter(slug => !existsSync(join(COURSE_DIRECTORY, slug, 'summary.pdf')))

    const browser = await puppeteer.launch({ headless: 'shell' })

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

    server.close((err) => {
        process.exit(err ? 1 : 0)
    })
})
