import axios from 'axios';
import { Request, Response, Express, NextFunction } from 'express';
import { auth } from 'express-openid-connect'
import { User } from '../domain/model/user';
import { read } from '../modules/neo4j';
import { formatUser } from '../utils';

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
}

export async function getToken(req: any): Promise<string> {
    return req.oidc.idToken;
}

export async function getUser(req: any): Promise<User | undefined> {
    if ( !req.oidc.user ) return undefined;
    if ( req.dbUser ) return req.dbUser;

    const res = await read(`MATCH (u:User {sub: $sub}) RETURN u`, { sub: req.oidc.user.sub })

    const dbUser = res.records.length ? res.records[0].get('u').properties : {}

    const user = formatUser({
        ...req.oidc.user,
        ...dbUser,
    })

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

    // @ts-ignore
    app.get('/login', (req, res) => res.oidc.login({ returnTo: req.query.returnTo || '/' }))

    app.use(async (req: Request, res: Response, next: NextFunction) => {
        // @ts-ignore
        res.locals.user = await getUser(req)
        // @ts-ignore
        res.locals.BASE_URL = process.env.BASE_URL

        next()
    })
}

