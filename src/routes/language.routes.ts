import { Router } from "express";
import { Language, LANGUAGE_CN, LANGUAGE_JP } from "../domain/model/course";
import { getCoursesByCategory } from "../domain/services/get-courses-by-category";
import { getUser } from "../middleware/auth.middleware";
import { forceTrailingSlash } from "../middleware/trailing-slash.middleware";
import { loadFile } from "../modules/asciidoc";
import { translate } from "../modules/localisation";

const router = Router({
    caseSensitive: true,
})

router.get(`/:language(${LANGUAGE_JP}|${LANGUAGE_CN})`, forceTrailingSlash, async (req, res, next) => {
    const language = req.params.language as Language

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