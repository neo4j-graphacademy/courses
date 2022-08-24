import path from 'path'
import express, { RequestHandler } from 'express'
import compression from 'compression'
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
import browserRoutes from './routes/browser.routes'
import languageRoutes from './routes/language.routes'
import certificationRoutes from './routes/certification.routes'
import apiRoutes from './routes/api'
import { applyErrorHandlers } from './middleware/error-handlers.middleware'
import { Driver } from 'neo4j-driver'
import { registerSession } from './middleware/session.middleware'
import { initBugsnag, useErrorHandler, useRequestHandler } from './middleware/bugsnag.middleware'
import { verifyJwt } from './middleware/verify-jwt.middleware'
import { initAnalytics } from './modules/analytics'
import { saveRef } from './middleware/save-ref.middleware'
import { endProfiling, startProfiling } from './middleware/profiling.middleware'
import { initLocalisation } from './modules/localisation'

import './constants'

export default function initApp(driver: Driver) {
    const app = express()

    app.use((req, res, next) => {
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

    // Gzip
    app.use(compression())

    // Start Profiling
    app.use(startProfiling)

    // Apply locals
    registerLocals(app)

    // Load in languages
    initLocalisation()

    // Apply auth headers
    applyAuth(app)

    app.use(verifyJwt)

    // Apply Session/Flash
    registerSession(app)

    // Save ?ref=xxx in Session
    app.use(saveRef)

    // Bugsnag Request Handler
    useRequestHandler(app)

    // Track PageViews
    initAnalytics()
    // app.use(trackPageview)

    // Routes
    app.use('/', homeRoutes)
    app.use('/account', accountRoutes)
    app.use('/categories', categoryRoutes)
    app.use('/courses', courseRoutes)
    app.use('/u', publicProfileRoutes)
    app.use('/certificates', certificateRoutes)
    app.use('/browser', browserRoutes)
    app.use('/api', apiRoutes)
    app.use('/', languageRoutes)
    app.use('/', pageRoutes)
    app.use('/', certificationRoutes)

    if (process.env.NODE_ENV === 'dev') {
        app.use('/test', testRoutes)
    }

    // Bugsnag Error Handler
    useErrorHandler(app)

    // Generic Error Handlers
    applyErrorHandlers(app)

    // End Profiling
    app.use(endProfiling)

    return app
}
