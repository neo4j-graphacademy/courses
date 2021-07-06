import fs from 'fs'
import path from 'path'
import { Express } from 'express'
import { STATUS_DRAFT } from '../domain/model/course'


export function registerLocals(app: Express) {
    const iconSvg = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'img', 'icon-color.svg'))
    const logoSvg = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'img', 'logo-color.svg'))
    const rightArrowSvg = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'img', 'cta-right-arrow.svg'))
    const iconBook = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'img', 'icon-book.svg'))
    const iconDuration = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'img', 'icon-duration.svg'))

    app.use((req, res, next) => {
        res.locals.statuses = {
            STATUS_DRAFT,
        }
        res.locals.baseUrl = process.env.AUTH0_BASE_URL
        res.locals.iconSvg = iconSvg
        res.locals.logoSvg = logoSvg
        res.locals.rightArrowSvg = rightArrowSvg
        res.locals.iconBook = iconBook
        res.locals.iconDuration = iconDuration

        next()
    })
}