import { Express } from 'express'
import helmet from "helmet"

export default function hardenExpress(app: Express) {
    app.disable('x-powered-by')
    app.use(
        // @ts-expect-error Problem with typings on helmet.frameguard
        helmet.frameguard({ action: 'sameorigin' }),
        helmet.contentSecurityPolicy({ useDefaults: true }),
        helmet.noSniff()
    )
}
