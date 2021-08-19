
import { Express, NextFunction, Request, Response } from 'express';
import NotFoundError from '../errors/not-found.error';

export function apply404handler(app: Express) {
    app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
        if ( (error as NotFoundError).status === 404 ) {
            return res.status(404)
                .render('errors/404', {
                    title: 'Page Not Found',
                    error
                })
        }

        next(error)
    })
}