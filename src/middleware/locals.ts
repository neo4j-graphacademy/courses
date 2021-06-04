import fs from 'fs'
import path from 'path'
import { Express } from 'express'
import { STATUS_DRAFT } from '../domain/model/course'


export function registerLocals(app: Express) {
    const iconSvg = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'img', 'icon-color.svg'))
    const logoSvg = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'img', 'logo-color.svg'))

    app.use((req, res, next) => {
        res.locals.status = {
            STATUS_DRAFT,
            fo: process.env.AUTH0_BASE_URL
        }
        res.locals.baseUrl = process.env.AUTH0_BASE_URL
        res.locals.iconSvg = iconSvg
        res.locals.logoSvg = logoSvg

        next()
    })
}