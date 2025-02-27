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
import certificationRoutes from './modules/certification/certification.routes'
import apiRoutes from './routes/api'
import teamRoutes from './routes/team.routes'
import { applyErrorHandlers } from './middleware/error-handlers.middleware'
import { Driver } from 'neo4j-driver'
import { registerSession } from './middleware/session.middleware'
import { initBugsnag, useErrorHandler, useRequestHandler } from './middleware/bugsnag.middleware'
import { verifyJwt } from './middleware/verify-jwt.middleware'
import { initAnalytics } from './modules/analytics/analytics.module'
import { saveRef } from './middleware/save-ref.middleware'
import { endProfiling, startProfiling } from './middleware/profiling.middleware'
import { initLocalisation } from './modules/localisation'
import './constants'
import { initPrintful } from './modules/printful'
import hardenExpress from './middleware/harden.middleware'
import initChatbot from './modules/chatbot'
import { registerTranslationMiddleware } from './middleware/translation.middleware'

export default function initApp(driver: Driver) {
    const app = express()

    app.use((req, res, next) => {
        req.neo4j = driver
        next()
    })

    app.use(express.urlencoded({ extended: true }) as RequestHandler)
    app.use(express.json() as RequestHandler)

    app.set('view engine', 'pug')

    // Security Hardening
    app.disable('x-powered-by')
    hardenExpress(app)

    // Init bugsnag
    initBugsnag()
    useErrorHandler(app)

    // Pre-auth static routes
    app.use(express.static(path.join(__dirname, '..', 'public')))

    // Gzip
    app.use(compression())

    // Start Profiling
    app.use(startProfiling)


    // Load in languages
    initLocalisation()

    // Apply Session/Flash
    registerSession(app)

    // Apply locals
    registerLocals(app)

    // Maintenance Mode
    // app.use(maintenance)

    // Apply auth headers
    applyAuth(app)

    app.use(verifyJwt)

    // Save ?ref=xxx in Session
    app.use(saveRef)

    // Bugsnag Request Handler
    useRequestHandler(app)

    // Track PageViews
    initAnalytics()
    // app.use(trackPageview)

    // Translations
    registerTranslationMiddleware(app)

    // Routes
    app.use('/', homeRoutes)
    app.use('/account', accountRoutes)
    app.use('/categories', categoryRoutes)
    app.use('/courses', courseRoutes)
    app.use('/u', publicProfileRoutes)
    app.use('/c', certificateRoutes)
    app.use('/browser', browserRoutes)
    app.use('/api', apiRoutes)
    app.use('/teams', teamRoutes)
    app.use('/', languageRoutes)
    app.use('/', pageRoutes)
    app.get('/certification', (req, res) => res.redirect('/certifications/'))
    app.use('/certifications', certificationRoutes)

    if (process.env.NODE_ENV === 'dev') {
        app.use('/test', testRoutes)
    }

    // Printful
    initPrintful(app)

    // Chatbot Routes
    void initChatbot(app)

    // Generic Error Handlers
    applyErrorHandlers(app)

    // End Profiling
    app.use(endProfiling)

    return app
}
