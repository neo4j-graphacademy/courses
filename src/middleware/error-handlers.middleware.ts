/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Express, NextFunction, Request, Response } from 'express';
import { IS_PRODUCTION } from '../constants';
import NotFoundError from '../errors/not-found.error';
import { getUser } from './auth.middleware';
import UnauthorizedError from '../errors/unauthorized.error';

// Helper function to check if error is a fetch error with status
function isFetchErrorWithStatus(error: any, status: number): boolean {
    return error.status === status ||
        (error.response && error.response.status === status) ||
        (error.cause && error.cause.status === status)
}

export function applyErrorHandlers(app: Express) {
    const notFoundError = (req: Request, res: Response, err?: Error) => {
        if (req.header('Content-type') == 'application/json') {
            return res.status(404).json({
                error: {
                    message: err?.message || 'Endpoint does not exist',
                }
            })
        }

        res.status(404)
            .render('simple', {
                title: 'Page Not Found',
                hero: {
                    title: 'Page Not Found',
                    byline: `We couldn't find anything at this address`,
                    overline: 'Oops',
                },
                content: `
                    <p>It looks like the page you are looking for does not exist.
                         Click the button below to go back to the course catalogue.
                    </p>
                    <!--
                    ${(!IS_PRODUCTION) && err && err.message ? '' : `<pre>${err?.message}</pre>`}
                    -->`,
                action: {
                    link: '/categories/',
                    text: 'View all courses'
                }
            })
    }

    const unauthorized = (err: Error, req: Request, res: Response) => {
        if (req.header('Content-type') == 'application/json') {
            return res.status(401).json({
                error: {
                    message: err.message || 'Unauthorized Request',
                }
            })
        }

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
                    text: 'View all courses'
                }
            })
    }

    app.use((req: Request, res: Response) => {
        notFoundError(req, res)
    })

    app.use(async (error: Error, req: Request, res: Response, next: NextFunction) => {
        const user = await getUser(req)

        if (error instanceof NotFoundError || (error as any).status === 404) {
            return notFoundError(req, res, error)
        }

        if (error instanceof UnauthorizedError || (error as any).status === 401) {
            return unauthorized(error, req, res)
        }

        if (isFetchErrorWithStatus(error, 401)) {
            let redirectTo = '/login'

            if (req.method === 'GET') {
                redirectTo += `?returnTo=${req.path}`
            }

            return res.redirect(redirectTo)
        }

        if (req.header('content-type') == 'application/json') {
            return res.status(500).json({
                status: 'error',
                message: error.message
            })
        }

        if (process.env.NODE_ENV === 'production') {
            console.log('resorting to to 500');
            console.log({ error });

            return res.status(500).render('simple', {
                title: 'Internal Server Error',
                hero: {
                    title: 'Internal Server Error',
                    byline: `It's our fault, not yours...`,
                    overline: 'Oops',
                },
                content: `<p>We are working hard to get this site up and running, but it looks like we dropped the ball on this one.
                    </p><p>Please try again later, or click the button below to go back to the course catalogue.</p>
                    ${user?.isNeo4jEmployee ? `<!-- ${error.message} -->` : ''}`,
                action: {
                    link: '/categories/',
                    text: 'View all courses'
                }
            })
        }

        next(error)
    })
}
