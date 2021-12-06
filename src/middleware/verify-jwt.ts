import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken'
import { TokenExpiredError } from '../errors/token-expired.error';
import { decode } from '../modules/jwt';
import { getToken, getUser } from './auth';
import { notify } from './bugsnag';

export async function verifyJwt(req: Request, res: Response, next: NextFunction) {
    const token = await getToken(req)

    if ( token ) {
        const claims: JwtPayload = await decode(token)

        const expiry = claims.exp

        if ( expiry && claims.exp! * 1000 < Date.now() ) {
            const user = await getUser(req)

            const error = new TokenExpiredError(expiry)

            notify(error, event => {
                event.setUser(user?.id, user?.email, user?.name)
                event.addMetadata('token', {
                    token,
                    claims,
                })
                event.addMetadata('request', {
                    method: req.method,
                    originalUrl: req.originalUrl,
                })
            })

            // If a GET request, logout and return to this URL
            if ( req.method === 'GET' ) {
                return res.redirect(`/logout?returnTo=${req.originalUrl}`)
            }
            else {
                throw error
            }
        }
    }

    next()
}