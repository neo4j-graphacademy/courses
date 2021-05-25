import path from 'path'
import express from 'express'
import applyAuth from './middleware/auth'
import { registerLocals } from './middleware/locals'
import homeRoutes from './routes/home'
import courseRoutes from './routes/courses'
import profileRoutes from './routes/profile'
import publicProfileRoutes from './routes/public-profile'
import testRoutes from './routes/test'
import { apply404handler } from './middleware/404'
import { Driver } from 'neo4j-driver'

export default function initApp(driver: Driver) {
    const app = express()

    app.use((req, res, next) => {
        // @ts-ignore
        req.neo4j = driver
        next()
    })

    app.use(express.urlencoded({ extended: true }))
    app.use(express.json())

    app.set('view engine', 'pug')

    // Pre-auth static routes
    app.use(express.static(path.join(__dirname, '..', 'public')))

    // Apply locals
    registerLocals(app)

    // Apply auth headers
    applyAuth(app)

    // Routes
    app.use('/', homeRoutes)
    app.use('/courses', courseRoutes)
    app.use('/profile', profileRoutes)
    app.use('/u', publicProfileRoutes)
    app.use('/browser', express.static( path.join(__dirname, '..', 'browser', 'dist') ))

    if ( process.env.NODE_ENV !== 'production' ) {
        app.use('/test', testRoutes)
    }

    // 404 error handler
    apply404handler(app)

    return app
}
