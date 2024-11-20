import { Express } from 'express'
import helmet from "helmet"
import nonce from 'nonce-express'
import { AUTH0_ISSUER_BASE_URL, DOMAIN, IS_PRODUCTION } from '../constants'

export default function hardenExpress(app: Express) {
    app.disable('x-powered-by')
    app.use(nonce())

    if (IS_PRODUCTION) {
        app.use(
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
                        'cdn.lr-ingest.com',
                        'consent.cookebot.com',
                        'consentcdn.cookebot.com',
                        'translate-pa.googleapis.com',
                        (req, res) => `'nonce-${res.locals.nonce}'`
                    ],
                    imgSrc: [
                        '*', 'data:'
                    ],
                    frameSrc: [
                        "'self'",
                        DOMAIN,
                        'www.youtube.com',
                        'www.googletagmanager.com',
                        AUTH0_ISSUER_BASE_URL as string,
                    ].filter(n => n !== undefined),
                    connectSrc: ['*'],
                    baseUri: [
                        "'self'",
                        'cdn.graphacademy.neo4j.com'
                    ],
                    workerSrc: [
                        "'self'",
                        'blob:',
                    ]
                }
            }),
            helmet.noSniff()
        )
    }
}
