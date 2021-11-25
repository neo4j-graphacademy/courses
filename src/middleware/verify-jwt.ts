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
            // TODO: Log user out if the token has expired
            const user = await getUser(req)

            notify(new TokenExpiredError(expiry), error => {
                error.setUser(user?.id, user?.email, user?.name)
                error.addMetadata('token', {
                    token,
                    claims,
                })
            })
        }
    }

    next()
}