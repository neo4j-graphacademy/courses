
import { Express, NextFunction, Request, Response } from 'express';
import NotFoundError from '../errors/not-found.error';

export function apply404handler(app: Express) {
    app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
        if ( (error as NotFoundError).status === 404 ) {
            return res.status(404)
                // .render('errors/404', {
                //     title: 'Page Not Found',
                //     error
                // })
                .render('simple', {
                    title: 'Page Not Found',
                    hero: {
                        title: 'Page Not Found',
                        byline: `We couldn't find anything at this address`,
                        overline: 'Oops',
                    },
                    content: `<p>We are working hard to complete our back catalogue but some courses may be missing.  Hit the button below to go back to the course catalogue.</p>`,
                    action: {
                        link: '/categories/',
                        text: 'View Course Catalogue'
                    }
                })
        }

        next(error)
    })
}