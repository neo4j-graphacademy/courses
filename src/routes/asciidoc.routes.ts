import { Router } from "express";
import { loadFile } from "../modules/asciidoc";

const router = Router()

router.get('/movies', (req, res) => {
    const file = loadFile('pages/movies.adoc')

    res.render('simple', {
        hero: {
            title: file.getTitle(),
            overline: file.getAttribute('overline'),
            byline: file.getAttribute('byline'),
        },
        title: file.getTitle(),
        content: file.getContent()
    })

})

export default router