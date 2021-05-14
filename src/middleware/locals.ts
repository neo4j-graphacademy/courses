import { Express } from 'express'
import { STATUS_DRAFT } from '../domain/model/course'


export function registerLocals(app: Express) {
    app.use((req, res, next) => {
        res.locals.status = {
            STATUS_DRAFT
        }

        next()
    })
}