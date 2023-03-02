import { Express } from 'express'
import helmet from "helmet"
import nonce from 'nonce-express'
import { DOMAIN, IS_PRODUCTION } from '../constants'

export default function hardenExpress(app: Express) {
    app.disable('x-powered-by')
    app.use(nonce())

    if (IS_PRODUCTION) {
        app.use(
            // @ts-expect-error Problem with typings on helmet.frameguard
            helmet.frameguard({ action: 'sameorigin' }),
            helmet.contentSecurityPolicy({
                useDefaults: true,
                directives: {
                    scriptSrc: [
                        "'self'",
                        DOMAIN,
                        '*.googletagmanager.com',
                        'static.ads-twitter.com',
                        'www.youtube.com',
                        'cdn.graphacademy.neo4j.com',
                        'neo4j.com',
                        's7.addthis.com',
                        'd2wy8f7a9ursnm.cloudfront.net',
                        (req, res) => `'nonce-${res.locals.nonce}'`
                    ],
                    imgSrc: [
                        "'self'",
                        "data:",
                        'neo4j.com',
                        'www.googletagmanager.com',
                        'cdn.graphacademy.neo4j.com',
                        'raw.githubusercontent.com',
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
}
