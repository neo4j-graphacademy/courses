/* eslint-disable */
import axios from 'axios';
import { Request, Response, Express, NextFunction } from 'express';
import { auth, Session } from 'express-openid-connect'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { UserLogin } from '../domain/events/UserLogin';
import { User } from '../domain/model/user';
import { emitter } from '../events';
import { read } from '../modules/neo4j';
import { formatUser } from '../utils';
import { BASE_URL } from '../constants';

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_CLIENT_SECRET || 'a long, randomly-generated string stored in env',
    baseURL: process.env.BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    routes: {
        login: false as false,
    },
    // Send event to segment
    afterCallback: async (req: Request, res: Response, session: Session, decodedState: { [key: string]: any }) => {
        const decoded: JwtPayload = jwt.decode(session.id_token) as JwtPayload

        if (decoded && decoded.sub) {
            emitter.emit(new UserLogin(decoded))
        }

        return session
    }
}

export async function getToken(req: any): Promise<string> {
    return req.oidc.idToken;
}

export async function getUser(req: any): Promise<User | undefined> {
    if (!req.oidc.user) return undefined;
    if (req.dbUser) return req.dbUser;

    const res = await read(`MATCH (u:User {sub: $sub}) RETURN u { .*, profileHidden: u:HiddenProfile } AS u`, { sub: req.oidc.user.sub })

    const dbUser = res.records.length ? res.records[0].get('u') : {}

    const user = formatUser({
        ...req.oidc.user,
        ...dbUser,
    })

    user.isNeo4jEmployee = user.email?.endsWith('neo4j.com') || user.email?.endsWith('neotechnology.com')

    // Populate feature flags
    if (!user.featureFlags) {
        user.featureFlags = []
    }

    req.dbUser = user

    return user
}

export async function getUserById(id: string): Promise<User | undefined> {
    const res = await read(`MATCH (u:User {id: $id}) RETURN u`, { id })

    return res.records[0]?.get('u').properties
}

export async function requestEmailVerification(user: User): Promise<string> {
    const api = axios.create({
        baseURL: 'https://internal-api.neo4jsandbox.com',
    })

    const res = await api.post('/v1/user/verification', {
        user_id: user.sub
    })

    return res.data.status
}

export default function applyAuth(app: Express) {
    // auth router attaches /login, /logout, and /callback routes to the baseURL
    app.use(auth(config));

    // Login route
    app.get('/login', (req: Request, res: Response) => {
        let returnUrl = '/'

        // is return url set?
        if (typeof req.query.returnTo == 'string') {
            returnUrl = req.query.returnTo
        }
        // where has the request come from?
        else if (typeof req.headers['referer'] == 'string') {
            returnUrl = req.headers['referer']
        }

        // create the URL
        const url = new URL(returnUrl, BASE_URL)

        // Append the ref for persistence after login
        if (typeof req.session['ref'] == 'string') {
            url.searchParams.set('ref', req.session['ref'])
        }

        res.oidc.login({ returnTo: url.toString() })
    })

    // Middleware to append user to request
    app.use(async (req: Request, res: Response, next: NextFunction) => {
        // @ts-ignore
        res.locals.user = await getUser(req)
        // @ts-ignore
        res.locals.BASE_URL = process.env.BASE_URL

        next()
    })
}
