import { Express } from 'express'
import Bugsnag from '@bugsnag/js'
import BugsnagPluginExpress from '@bugsnag/plugin-express'



export function initBugsnag() {
    if ( bugsnagApiKey() ) {
        Bugsnag.start({
            apiKey: process.env.BUGSNAG_API_KEY as string,
            plugins: [ BugsnagPluginExpress ]
        })
    }
}

export function bugsnagApiKey(): string | undefined {
    return process.env.BUGSNAG_API_KEY
}

export function useRequestHandler(app: Express) {
    if ( !bugsnagApiKey() ) return;

    const plugin = Bugsnag.getPlugin('express')

    if ( plugin ) {
        app.use( plugin.requestHandler )
    }
}

export function useErrorHandler(app: Express) {
    if ( !bugsnagApiKey() ) return;

    const plugin = Bugsnag.getPlugin('express')

    if ( plugin ) {
        app.use( plugin!.errorHandler )
    }
}

export function notify(error: Error) {
    if ( bugsnagApiKey() ) {
        Bugsnag.notify(error)
    }
}