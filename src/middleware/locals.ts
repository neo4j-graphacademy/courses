import { Express } from 'express'
import { STATUS_DRAFT } from '../domain/model/course'


export function registerLocals(app: Express) {
    app.use((req, res, next) => {
        res.locals.status = {
            STATUS_DRAFT,
            fo: process.env.AUTH0_BASE_URL
        }
        res.locals.baseUrl = process.env.AUTH0_BASE_URL

        next()
    })
}