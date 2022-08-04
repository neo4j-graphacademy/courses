import { NextFunction, Request, Response } from "express";
import { getUser } from './auth.middleware'

export async function requiredCompletedProfile(req: Request, res: Response, next: NextFunction) {
    const user = await getUser(req)
    
    if ( user && (!user.givenName && !user.profileCompletedAt) ) {
        return res.redirect(`/account/complete/?returnTo=${req.originalUrl}`)
    }

    next()
}