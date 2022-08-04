import { Router } from "express";
import { BASE_URL, CDN_URL } from "../constants";
import { forceTrailingSlash } from "../middleware/trailing-slash.middleware";
import { loadFile } from "../modules/asciidoc";

const router = Router({
    caseSensitive: true,
})

router.get(`/certification`, forceTrailingSlash, (req, res, next) => {
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
            ogImage: CDN_URL ?  `${CDN_URL}/img/categories/banners/certification.png` : `${BASE_URL}/img/og/og-categories.png`
        })
    }
    catch (e) {
        next(e)
    }
})

export default router
