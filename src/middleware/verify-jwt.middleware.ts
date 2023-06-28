import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken'
import { TokenExpiredError } from '../errors/token-expired.error';
import { decode } from '../modules/jwt';
import { getToken } from './auth.middleware';

export async function verifyJwt(req: Request, res: Response, next: NextFunction) {
    const token = await getToken(req)

    if (token) {
        const claims: JwtPayload = decode(token)

        const expiry = claims.exp

        if (expiry && (claims?.exp as number * 1000) < Date.now()) {
            const error = new TokenExpiredError(expiry)

            // If a GET request, logout and return to this URL
            if (req.method === 'GET') {
                return res.redirect(`/logout?returnTo=${req.originalUrl}`)
            }
            else {
                next(error)
            }
        }
    }

    next()
}
