import { copyFileSync, existsSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from "fs"
import { COURSE_DIRECTORY, PUBLIC_DIRECTORY } from "../constants"
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
        // Check that slides should be generated
        .filter(slug => {
            const path = join(COURSE_DIRECTORY, slug, 'course.adoc')
            const hasPdf = readFileSync(path).toString().includes(':slides: true')

            return hasPdf
        })
        // Ignore if slides.pdf already exists
        .filter(slug => !existsSync(join(COURSE_DIRECTORY, slug, 'slides.pdf')))

    const browser = await puppeteer.launch({ headless: 'shell' })

    for (const course of courses) {
        const page = await browser.newPage()
        await page.goto(`http://localhost:3001/${course}/slides`, { waitUntil: 'networkidle0' })
        const pdf = await page.pdf({
            // format: 'A4', 
            width: '680px',
            height: '1220px',
            landscape: true,
            printBackground: true,
        })

        // write pdf to file system
        await writeFileSync(
            join(COURSE_DIRECTORY, course, 'slides.pdf'),
            pdf,
            {}
        )

        // write to public directory 
        const publicPath = join(PUBLIC_DIRECTORY, 'slides', `${course}.pdf`)
        if (existsSync(publicPath)) {
            await unlinkSync(publicPath)
        }

        await writeFileSync(
            publicPath,
            pdf,
            {}
        )
    }

    console.log(`📖 ${courses.length} Slides PDFs generated`)
}


const server = app.listen(3001, async () => {
    await main()

    server.close((err) => {
        process.exit(err ? 1 : 0)
    })
})
