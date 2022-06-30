import { Router } from "express";
import { LANGUAGE_JP } from "../domain/model/course";
import { getCoursesByCategory } from "../domain/services/get-courses-by-category";
import { getUser } from "../middleware/auth.middleware";
import { forceTrailingSlash } from "../middleware/trailing-slash.middleware";
import { loadFile } from "../modules/asciidoc";
import { getPhrase, translate } from "../modules/localisation";

const router = Router()

router.get(`/${LANGUAGE_JP}`, forceTrailingSlash, async (req, res, next) => {
    // TODO: Make this dynamic
    const language = LANGUAGE_JP

    try {
        const user = await getUser(req)
        const categories = await getCoursesByCategory(user, language)

        const file = loadFile(`categories/${language}.adoc`)

        const category =  categories.find(parent => parent.slug === 'languages')
            ?.children?.find(child => child.slug === language)

        const courses = category?.courses || []

        res.render('course/landing', {
            hero: {
                title: file.getTitle(),
                overline: file.getAttribute('overline'),
                byline: file.getAttribute('caption'),
            },
            title: file.getTitle(),
            content: file.getContent(),
            levelTitle: file.getAttribute('level-title'),
            levelOverline: file.getAttribute('level-overline'),
            courses,
            language,
            translate: translate(language),
        })
    }
    catch(e) {
        next(e)
    }
})

export default router