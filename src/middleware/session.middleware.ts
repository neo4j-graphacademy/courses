import { Express } from 'express'
import session from 'express-session'
import flash from 'express-flash'
import { getDriver } from '../modules/neo4j'
import Neo4jStore from './neo4j-session-store.middleware'


export function registerSession(app: Express) {
    app.use(session({
        secret: process.env.SESSION_SECRET || 'a really long secret',
        cookie: { maxAge: 60000, sameSite: 'strict' },
        resave: true,
        saveUninitialized: true,
        store: new Neo4jStore(getDriver()),
    }))
    app.use(flash())
}
