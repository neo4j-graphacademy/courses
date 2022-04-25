/* tslint:disable */
import { Express } from 'express'
import { AppInit } from '../domain/events/AppInit'
import { emitter, Listener } from '../events'
import { Server } from 'http'
import initAnalyticsListeners from './analytics'
import initEmailListeners from './emails'
import { AddressInfo } from 'net'
import initSandboxListeners from './sandbox'

export default async function initListeners(app: Express): Promise<void> {
    emitter.on<AppInit>(AppInit, event => {
        const address: AddressInfo = event.server.address() as AddressInfo
        const port = address.port

        console.log(`\n\n--\n🚀 Listening on http://localhost:${port}\n`)
    })

    // Email Listeners
    initEmailListeners()

    // Listeners for Segment
    initAnalyticsListeners()

    // Init sandbox listeners
    initSandboxListeners()
}
