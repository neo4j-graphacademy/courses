import { Request, Response, Express } from 'express';
import { auth } from 'express-openid-connect'
import { User } from '../domain/model/user';

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_CLIENT_SECRET || 'a long, randomly-generated string stored in env',
    baseURL: process.env.AUTH0_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
};

export function getToken(req: any): string {
    return req.oidc.idToken;
}

export function getUser(req: any): User {
    return req.oidc.user
}

export default function applyAuth(app: Express) {
    // auth router attaches /login, /logout, and /callback routes to the baseURL
    app.use(auth(config));

    app.use((req: Request, res: Response, next: Function) => {
        // @ts-ignore
        res.locals.user = getUser(req)
        // @ts-ignore
        res.locals.BASE_URL = process.env.BASE_URL
        next()
    })
}