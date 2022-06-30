import session from 'express-session';
import flash from 'express-flash';
import { Express } from 'express'
import  { createClient } from 'redis';
let RedisStore = require('connect-redis')(session);

let redisClient = createClient({
    url: process.env.REDIS_HOST || 'redis://localhost:6379',
    legacyMode: true })
redisClient.connect().catch(console.error)

export function registerSession(app: Express) {
app.use(
  session({
    store:  new RedisStore({ client: redisClient }),
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || 'a really long secret',
    resave: true,
    cookie: { maxAge: 60000, sameSite: 'strict' },
  })
)
app.use(flash());
}