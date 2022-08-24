import { AppInit } from '../domain/events/AppInit'
import { emitter } from '../events'
import initAnalyticsListeners from '../modules/analytics/analytics.listeners'
import initEmailListeners from './emails'
import { AddressInfo } from 'net'
import initSandboxListeners from '../modules/sandbox/listeners/sandbox.listeners'

export default async function initListeners(): Promise<void> {
    emitter.on<AppInit>(AppInit, event => {
        const address: AddressInfo = event.server.address() as AddressInfo
        const port = address.port

        console.log(`\n\n--\n🚀 Listening on http://localhost:${port}\n`)
    })

    // Email Listeners
    await initEmailListeners()

    // Listeners for Segment
    await initAnalyticsListeners()

    // Init sandbox listeners
    await initSandboxListeners()
}
