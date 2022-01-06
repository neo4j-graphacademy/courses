import path from 'path'
import express, { RequestHandler } from 'express'
import applyAuth from './middleware/auth.middleware'
import { registerLocals } from './middleware/locals.middleware'

import homeRoutes from './routes/home.routes'
import courseRoutes from './routes/course.routes'
import publicProfileRoutes from './routes/public-profile.routes'
import categoryRoutes from './routes/category.routes'
import accountRoutes from './routes/account.routes'
import certificateRoutes from './routes/certificate.routes'
import testRoutes from './routes/testing.routes'
import pageRoutes from './routes/asciidoc.routes'

import { applyErrorhandlers } from './middleware/error-handlers.middleware'
import { Driver } from 'neo4j-driver'
import { registerSession } from './middleware/session.middleware'
import { initBugsnag, useErrorHandler, useRequestHandler } from './middleware/bugsnag.middleware'
import { verifyJwt } from './middleware/verify-jwt.middleware'
// import { initAnalytics } from './modules/analytics'
// import { trackPageview } from './middleware/track-pageview.middleware'

export default function initApp(driver: Driver) {
    const app = express()

    app.use((req, res, next) => {
        // @ts-ignore
        req.neo4j = driver
        next()
    })

    app.use(express.urlencoded({ extended: true }) as RequestHandler)
    app.use(express.json() as RequestHandler)

    app.set('view engine', 'pug')

    // Init bugsnag
    initBugsnag()

    // Pre-auth static routes
    app.use(express.static(path.join(__dirname, '..', 'public')))

    // Apply locals
    registerLocals(app)

    // Apply auth headers
    applyAuth(app)

    app.use(verifyJwt)

    // Apply Session/Flash
    registerSession(app)

    // Bugsnag Request Handler
    useRequestHandler(app)

    // Track PageViews
    // initAnalytics()
    // app.use(trackPageview)

    // Routes
    app.use('/', homeRoutes)
    app.use('/account', accountRoutes)
    app.use('/categories', categoryRoutes)
    app.use('/courses', courseRoutes)
    app.use('/u', publicProfileRoutes)
    app.use('/certificates', certificateRoutes)
    app.use('/browser', express.static( path.join(__dirname, '..', 'browser', 'dist') ))
    app.use('/', pageRoutes)

    if ( process.env.NODE_ENV === 'dev' ) {
        app.use('/test', testRoutes)
    }

    // Bugsnag Error Handler
    useErrorHandler(app)

    // Generic Error Handlers
    applyErrorhandlers(app)

    return app
}
