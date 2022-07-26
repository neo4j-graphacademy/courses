import { NextFunction, Request, Response } from "express";

export function forceTrailingSlash(req: Request, res: Response, next: NextFunction) {
    let { originalUrl } = req
    let append = ''

    // Split if query string exists
    if ( originalUrl.includes('?') ) {
        [ originalUrl, append ] = originalUrl.split('?', 2)
    }

    // Redirect if URL doesn't have a trailing slash
    if ( !originalUrl.endsWith('/') ) {
        let redirectTo = `${originalUrl}/`
        if ( append ) redirectTo += `?${append}`

        return res.redirect(redirectTo)
    }

    next()
}
