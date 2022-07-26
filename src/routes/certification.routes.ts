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

router.get(`/certification`, forceTrailingSlash, async (req, res, next) => {
    try {
        const file = loadFile(`pages/certification.adoc`)
        
        // const user = await getUser(req)
        // const categories = await getCoursesByCategory(user, language)
        // const category =  categories.find(parent => parent.slug === 'certification')

        // const courses = category?.courses || []

        res.render('page', {
            hero: {
                title: file.getTitle(),
                overline: file.getAttribute('overline'),
                byline: file.getAttribute('caption'),
            },
            title: file.getTitle(),
            content: file.getContent(),
            levelTitle: file.getAttribute('level-title'),
            levelOverline: file.getAttribute('level-overline'),
            courses: false,
            classes: 'certification',
            // courses,
            // language,
            // translate: translate(language),
        })
    }
    catch(e) {
        next(e)
    }
})

export default router