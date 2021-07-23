import fs from 'fs'
import path from 'path'
import { Express } from 'express'
import { STATUS_DRAFT } from '../domain/model/course'


export function registerLocals(app: Express) {
    // const iconSvg = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'img', 'icon-color.svg'))
    // const logoSvg = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'img', 'logo-color.svg'))
    // const rightArrowSvg = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'img', 'cta-right-arrow.svg'))
    // const iconBook = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'img', 'icon-book.svg'))
    // const iconDuration = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'img', 'icon-duration.svg'))

    // Load CSVs from public/img/svg
    const svgFolder = path.join(__dirname, '..', '..', 'resources', 'svg')
    const svg = Object.fromEntries(fs.readdirSync(svgFolder)
        .filter(file => file.endsWith('.svg'))
        .map(file => [file.replace('.svg', ''), fs.readFileSync(path.join(svgFolder, file)).toString()])
    )

    app.use((req, res, next) => {
        res.locals.statuses = {
            STATUS_DRAFT,
        }
        res.locals.baseUrl = process.env.BASE_URL
        res.locals.svg = svg

        next()
    })
}