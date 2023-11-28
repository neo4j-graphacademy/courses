import { Express } from 'express'
import session from 'express-session'
import flash from 'express-flash'
import { getDriver } from '../modules/neo4j'
import Neo4jStore from './neo4j-session-store.middleware'
import { createClient } from 'redis'
import cookieParser from 'cookie-parser'
import { DOMAIN, IS_PRODUCTION, REDIS_HOST } from '../constants'

import connectRedis from 'connect-redis'
import { notify } from './bugsnag.middleware'

function createRedisStore() {
    const RedisStore = connectRedis(session);
    const client = createClient({
        url: REDIS_HOST,
        legacyMode: true,
    })

    client.connect()
        .catch(e => {
            notify(e)
        })

    return new RedisStore({
        client,
    })
}

function createNeo4jStore() {
    return new Neo4jStore(getDriver())
}

export function registerSession(app: Express) {
    let store

    if (REDIS_HOST) {
        store = createRedisStore()
    }
    else {
        store = createNeo4jStore()
    }

    app.use(session({
        secret: process.env.SESSION_SECRET || 'a really long secret',
        cookie: {
            maxAge: 60000,
            sameSite: 'strict',
            secure: IS_PRODUCTION,
            domain: DOMAIN,
        },
        resave: true,
        saveUninitialized: true,
        store,
    }))
    app.use(flash())
    app.use(cookieParser())
}
