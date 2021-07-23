import { Express } from 'express'
import session from 'express-session'
import flash from 'express-flash'

export function registerSession(app: Express) {
    // TODO: Neo4j session store?
    app.use(session({
        secret: process.env.SESSION_SECRET || 'a really long secret',
        cookie: { maxAge: 60000, sameSite: 'strict' },
        resave: true,
        saveUninitialized: true,
    }))
    app.use(flash())
}