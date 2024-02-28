import { Router } from "express";
import { BASE_URL, CDN_URL } from "../constants";
import { forceTrailingSlash } from "../middleware/trailing-slash.middleware";
import { loadFile } from "../modules/asciidoc";
import getCertifications from "../domain/services/get-certifications";
import { canonical } from "../utils";

const router = Router({
    caseSensitive: true,
})

router.get(`/certification`, forceTrailingSlash, async (req, res, next) => {
    try {
        const file = loadFile(`pages/certification.adoc`)

        const certifications = await getCertifications()

        res.render('certification', {
            hero: {
                title: file.getTitle(),
                // overline: file.getAttribute('overline'),
                byline: file.getAttribute('caption'),
            },
            canonical: canonical(req.originalUrl),
            title: file.getTitle(),
            content: file.getContent(),
            certifications: certifications.reverse(),
            classes: 'certifications',
            ogImage: CDN_URL ? `${CDN_URL}/img/categories/banners/certification.png` : `${BASE_URL}/img/og/og-categories.png`
        })
    }
    catch (e) {
        next(e)
    }
})

export default router
