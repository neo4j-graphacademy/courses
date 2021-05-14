
import { Express, Request, Response } from 'express';
import NotFoundError from '../errors/not-found.error';

export function apply404handler(app: Express) {
    app.use((error: Error, req: Request, res: Response, next: Function) => {
        if ( (<NotFoundError> error).status ) {
            return res.status((<NotFoundError> error).status).send(error.message)
        }

        next(error)
    })
}