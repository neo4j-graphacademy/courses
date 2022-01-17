/* tslint:disable */
import { Express } from 'express'
import { AppInit } from '../domain/events/AppInit'
import { emitter } from '../events'
import initAnalyticsListeners from './analytics'
import initEmailListeners from './emails'

export default async function initListeners(app: Express): Promise<void> {
    emitter.on<AppInit>(AppInit, () => console.log(`\n\n--\n🚀 Listening on http://localhost:3000\n`))

    // Email Listeners
    initEmailListeners()

    // Listeners for Segment
    initAnalyticsListeners()
}
