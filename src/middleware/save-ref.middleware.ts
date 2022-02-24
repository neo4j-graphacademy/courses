import { NextFunction, Request, Response } from "express";

/**
 * Where `?ref=xxx` is set, save that against the current session so it can be used later
 *
 * @param req Express Request
 * @param res Express Response
 * @param next Next middleware
 */
export function saveRef(req: Request, res: Response, next: NextFunction) {
    if ( req.query.ref ) {
        const session = req.session

        // @ts-ignore
        session.ref = req.query.ref
    }

    next()
}

/**
 * Attempt to extract the ref value from the current session
 *
 * @param req Express Request
 * @returns string|undefined
 */
export function getRef(req: Request): string | undefined {
    // @ts-ignore
    return req.session.ref
}
