import { Express } from 'express'
import helmet from "helmet"
import nonce from 'nonce-express'
import { DOMAIN } from '../constants'

export default function hardenExpress(app: Express) {
    app.disable('x-powered-by')
    app.use(nonce())
    app.use(
        // @ts-expect-error Problem with typings on helmet.frameguard
        helmet.frameguard({ action: 'sameorigin' }),
        helmet.contentSecurityPolicy({
            useDefaults: true,
            directives: {
                scriptSrc: [
                    "'self'",
                    DOMAIN,
                    'googletagmanager.com',
                    'www.youtube.com',
                    'cdn.graphacademy.neo4j.com',
                    'neo4j.com',
                    (req, res) => `'nonce-${res.locals.nonce}'`
                ],
                imgSrc: [
                    "'self'",
                    "data:",
                    'neo4j.com',
                    'www.googletagmanager.com',
                    'cdn.graphacademy.neo4j.com',
                    'i.ytimg.com',
                ],
                frameSrc: [
                    "'self'",
                    DOMAIN,
                    'www.youtube.com',
                ],
                connectSrc: ['*']
            }
        }),
        helmet.noSniff()
    )
}
