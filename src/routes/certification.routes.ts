import { Router } from "express";
import { forceTrailingSlash } from "../middleware/trailing-slash.middleware";
import { loadFile } from "../modules/asciidoc";

const router = Router({
    caseSensitive: true,
})

router.get(`/certification`, forceTrailingSlash, async (req, res, next) => {
    try {
        const file = loadFile(`pages/certification.adoc`)

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
        })
    }
    catch (e) {
        next(e)
    }
})

export default router