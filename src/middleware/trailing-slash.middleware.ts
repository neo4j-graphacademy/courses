import { NextFunction, Request, Response } from "express";

export function forceTrailingSlash(req: Request, res: Response, next: NextFunction) {
    const { originalUrl } = req
    if ( !originalUrl.endsWith('/') ) {
        return res.redirect(`${originalUrl}/`)
    }

    next()
}