import path, { basename } from 'path'
import fs from 'fs'
import pug from 'pug'
import nodeHtmlToImage from 'node-html-to-image'
import { ASCIIDOC_DIRECTORY, CATEGORY_DIRECTORY, COURSE_DIRECTORY, PUBLIC_DIRECTORY } from '../constants'

import { loadFile } from '../modules/asciidoc'
import { categoryBadgePath, categoryBannerPath, categoryOverviewPath, courseBackgroundPath, courseBadgePath, courseBannerPath, courseIllustrationPath, courseOverviewPath, coursePublicBackgroundPath, coursePublicBadgePath, coursePublicBannerPath, coursePublicIllustrationPath } from '../utils'

const main = async () => {
    await render(path.join(PUBLIC_DIRECTORY, 'img', 'og', `og-landing.png`), 'Neo4j GraphAcademy', 'Free, Hands-on training.  No installation required.', 'Learn everything you need to know about Neo4j from the experts.')

    await renderCourses()
    await renderCategories()
    await copyImageAssets()
}

async function render(outputTo: string, overline: string | undefined, title: string, byline: string, badge?: string) {
    const bannerFunction = pug.compileFile(path.join(__dirname, '..', '..', 'views', 'banner.pug'))
    const css = fs.readFileSync(path.join(__dirname, '..', '..', 'resources', 'css', 'banner.css'))

    const html = bannerFunction({
        overline,
        title,
        byline,
        badge,
        css,
    })

    const output = await nodeHtmlToImage({
        output: outputTo,
        type: 'png',
        html,
    })

    return output.toString()
}

async function renderCourseBanner(slug: string) {
    const file = loadFile(courseOverviewPath(slug))

    await render(
        courseBannerPath(slug),
        file.getAttribute('overline'),
        file.getTitle()!,
        file.getAttribute('caption'),
        fs.readFileSync(courseBadgePath(slug)).toString()
    )

    return slug
}

async function renderCategoryBanner(slug: string) {
    const file = loadFile(categoryOverviewPath(slug))

    const badgePath = categoryBadgePath(slug)
    const badge = fs.existsSync(badgePath) ? fs.readFileSync(badgePath).toString() : ''

    await render(
        categoryBannerPath(slug),
        file.getAttribute('overline'),
        file.getTitle()!,
        file.getAttribute('caption'),
        badge,
    )

    return slug
}


async function renderCourses() {
    const courses = fs.readdirSync(COURSE_DIRECTORY)

    // Generate Course Banner Images
    const res = await Promise.all(
        courses.filter(slug => {
            const stats = fs.statSync(path.join(COURSE_DIRECTORY, slug))
            return stats.isDirectory() && !fs.existsSync(courseBannerPath(slug))
        })
            .map(slug => renderCourseBanner(slug))
    )

    console.log(`🌅 ${res.length} course banner${res.length == 1 ? '' : 's'} generated`)
}

async function renderCategories() {
    const categories = fs.readdirSync(CATEGORY_DIRECTORY)
        .map(filename => basename(filename, '.adoc'))

    // Generate Category Banners
    const res = await Promise.all(
        categories.filter(slug => !fs.existsSync(categoryBannerPath(slug)))
            .map(slug => renderCategoryBanner(slug))
    )

    console.log(`🌠 ${res.length} category banner${res.length == 1 ? '' : 's'} generated`)
}

async function copyImageAssets() {
    // Copy badges to public
    fs.readdirSync(COURSE_DIRECTORY)
        .filter(slug => fs.existsSync(courseBannerPath(slug)))
        .map(slug => [courseBannerPath(slug), coursePublicBannerPath(slug)])
        .map(([src, dest]) => fs.copyFileSync(src, dest))

    // Copy banners to public
    fs.readdirSync(COURSE_DIRECTORY)
        .filter(slug => fs.existsSync(courseBannerPath(slug)))
        .map(slug => [courseBannerPath(slug), coursePublicBannerPath(slug)])
        .map(([src, dest]) => fs.copyFileSync(src, dest))

    // Copy illustrations to public
    fs.readdirSync(COURSE_DIRECTORY)
        .filter(slug => fs.existsSync(courseIllustrationPath(slug)))
        .map(slug => [courseBadgePath(slug), coursePublicIllustrationPath(slug)])
        .map(([src, dest]) => fs.copyFileSync(src, dest))

    // Copy backgrounds to public
    fs.readdirSync(COURSE_DIRECTORY)
        .filter(slug => fs.existsSync(courseBackgroundPath(slug)))
        .map(slug => [courseBackgroundPath(slug), coursePublicBackgroundPath(slug)])
        .map(([src, dest]) => fs.copyFileSync(src, dest))
}

main()
