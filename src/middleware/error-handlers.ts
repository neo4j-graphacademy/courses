import { AxiosError } from 'axios'
import { Express, NextFunction, Request, Response } from 'express';
import NotFoundError from '../errors/not-found.error';

export function applyErrorhandlers(app: Express) {
    const notFoundError = (req: Request, res: Response) => {
        res.status(404)
            .render('simple', {
                title: 'Page Not Found',
                hero: {
                    title: 'Page Not Found',
                    byline: `We couldn't find anything at this address`,
                    overline: 'Oops',
                },
                content: `<p>We are working hard to complete our back catalogue but some courses may be missing.  Click the button below to go back to the course catalogue.</p>`,
                action: {
                    link: '/categories/',
                    text: 'View Course Catalogue'
                }
            })
    }

    const unauthorized = (err: Error, req: Request, res: Response) => {
        res.status(401)
            .render('simple', {
                title: 'Unauthorized Request',
                hero: {
                    title: 'Unauthorized Request',
                    byline: 'You are unable to perform this request.',
                    overline: 'Oops',
                },
                content: `<p>${err.message}</p>`,
                action: {
                    link: '/categories/',
                    text: 'View Course Catalogue'
                }
            })
    }

    app.use((req: Request, res: Response) => {
        notFoundError(req, res)
    })

    app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
        if ( (error as NotFoundError).status === 404 ) {
            return notFoundError(req, res)
        }

        if ( (error as NotFoundError).status === 401 ) {
            return unauthorized(error, req, res)
        }

        if ( (error as AxiosError).response?.status === 401 ) {
            let redirectTo = '/login'

            if ( req.method === 'GET' ) {
                redirectTo += `?returnTo=${req.path}`
            }

            return res.redirect(redirectTo)
        }

        if ( process.env.NODE_ENV === 'production' ) {
            return res.status(500)
                .render('simple', {
                    title: 'Internal Server Error',
                    hero: {
                        title: 'Internal Server Error',
                        byline: `It's our fault, not yours...`,
                        overline: 'Oops',
                    },
                    content: `<p>We are working hard to get this site up and running, but it looks like we dropped the ball on this one.
                    </p><p>Please try again later, or click the button below to go back to the course catalogue.</p>`,
                    action: {
                        link: '/categories/',
                        text: 'View Course Catalogue'
                    }
                })
        }

        next(error)
    })
}