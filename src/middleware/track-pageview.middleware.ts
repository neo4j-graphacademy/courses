import { Request, Response, NextFunction } from 'express'
import { trackPageview as handleTrackPageview } from '../modules/analytics'
import { getUser } from "./auth.middleware"

export async function trackPageview(req: Request, res: Response, next: NextFunction) {
    const user = await getUser(req)

    // Only track pageviews where the user is logged in
    if ( user ) {
        handleTrackPageview(user, req)
    }

    next()
}