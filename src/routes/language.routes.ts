import { Router } from "express";
import { CourseWithProgress, Language, LANGUAGE_CN, LANGUAGE_JP } from "../domain/model/course";
import { getCoursesByCategory } from "../domain/services/get-courses-by-category";
import { getUser } from "../middleware/auth.middleware";
import { forceTrailingSlash } from "../middleware/trailing-slash.middleware";
import { loadFile } from "../modules/asciidoc";
import { translate } from "../modules/localisation";
import { getUserEnrolments } from "../domain/services/get-user-enrolments";

const router = Router({
    caseSensitive: true,
})

router.get('/:language(pt|es)', forceTrailingSlash, async (req, res, next) => {
    const language = req.params.language as Language

    try {
        // Set ref cookie if none exists
        res.cookie('ref', req.cookies.ref || language)

        const user = await getUser(req)
        const categories = await getCoursesByCategory(user, language)

        const file = loadFile(`categories/${language}.adoc`)

        // Get current courses
        let current: CourseWithProgress[] = []

        if (user) {
            try {
                const output = await getUserEnrolments(user.sub)
                current = output.enrolments.enrolled || []

                current.sort((a, b) => a.lastSeenAt && b.lastSeenAt && a.lastSeenAt > b.lastSeenAt ? -1 : 1)
            }
            catch (e) {
                current = []
            }
        }

        const beginners = categories.find(category => category.slug === 'experience')
            ?.children?.find(child => child.slug === 'beginners')

        const paths = categories?.find(category => category.slug === 'paths')

        // TODO: Reinstate these categories
        if (paths?.children) {
            paths.children = paths?.children.filter(category => !['aura', 'administrator', 'analyst'].includes(category.slug))
        }

        const certification = categories.find(category => category.slug === 'certification')

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
            beginners,
            certification,
            language,
            classes: `home ${language}`,
            translate: translate(language),
            forceTranslation: true
        })
    }
    catch (e) {
        next(e)
    }
})

/**
 * Failed experiments
 */
router.get(`/:language(${LANGUAGE_JP}|${LANGUAGE_CN})`, forceTrailingSlash, async (req, res, next) => {
    return res.redirect('/')
})

export default router