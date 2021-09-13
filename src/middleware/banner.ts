import path from 'path'
import fs from 'fs'
import pug from 'pug'
import nodeHtmlToImage from 'node-html-to-image'
import { NextFunction, Request, Response } from "express"
import { getSvgs } from "../utils";

export async function bannerHandler(req: Request, res: Response, next: NextFunction, overline: string | undefined, title: string, byline: string, badge?: string) {
    try {
        const bannerFunction = pug.compileFile(path.join(__dirname, '..', '..', 'views', 'layouts', 'banner.pug'))

        const css = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'css', 'app.css'))

        const html = bannerFunction({
            overline,
            title,
            byline,
            badge,
            css,
            svg: getSvgs(),
        })

        const image = await nodeHtmlToImage({ html, });

        res.contentType('image/png')
            .send(image)


    }
    catch (e) {
        next(e)
    }
}