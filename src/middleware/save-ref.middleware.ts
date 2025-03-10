/* eslint-disable */
import { NextFunction, Request, Response } from "express";

/**
 * Where `?ref=xxx` is set, save that against the current session so it can be used later
 *
 * @param req Express Request
 * @param res Express Response
 * @param next Next middleware
 */
export function saveRef(req: Request, res: Response, next: NextFunction) {
    if (req.query.ref) {
        req.session['ref'] = req.query.ref
        res.cookie('ref', req.session['ref'])
    }
    else if (req.query.utm_source) {
        req.session['ref'] = `${req.query.utm_source}--${req.query.utm_medium}||${req.query.utm_campaign}||${req.query.utm_content}`
        res.cookie('ref', req.session['ref'])
    }

    if (req.query.category) {
        req.session['category'] = req.query.category
        res.cookie('category', req.session['category'])
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
    return req.session.ref || req.cookies.ref
}
/**
 * Attempt to extract the `team` value from the current session
 *
 * @param req Express Request
 * @returns string|undefined
 */
export function getTeam(req: Request): string | undefined {
    // @ts-ignore
    return req.session.team || req.cookies.team
}

/**
 * Attempt to extract the `category` value from the current session
 *
 * @param req Express Request
 * @returns string|undefined
 */
export function getCategory(req: Request): string | undefined {
    // @ts-ignore
    return req.session.category || req.cookies.category
}
