import { Express } from 'express'
import { PRINTFUL_API_KEY, PRINTFUL_STORE_ID } from '../../constants'
import initPrintfulListeners from './printful.listeners'
import printulWebhookRoutes from './routes/printful-webhook.routes'

export function initPrintful(app: Express): void {
    if (PRINTFUL_API_KEY && PRINTFUL_STORE_ID) {
        // API Routes
        app.use('/api/printful', printulWebhookRoutes)

        // Event Listeners
        initPrintfulListeners()
    }
}
