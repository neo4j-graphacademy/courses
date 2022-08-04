import { Express } from 'express'
import Bugsnag, { OnErrorCallback } from '@bugsnag/js'
import BugsnagPluginExpress from '@bugsnag/plugin-express'
import Neo4jError from '../errors/neo4j.error'

export function initBugsnag() {
    if ( bugsnagApiKey() ) {
        Bugsnag.start({
            apiKey: process.env.BUGSNAG_API_KEY as string,
            plugins: [ BugsnagPluginExpress ],
            onError: event => {
                event.errors.map(error => {
                    if ( error instanceof Neo4jError )  {
                        event.addMetadata('query', {
                            query: error.query,
                            parameters: error.parameters,
                            database: error.database,
                        })
                    }
                })
            },
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
        app.use( plugin.errorHandler )
    }
}

export function notify(error: Error, onError?: OnErrorCallback) {
    if ( bugsnagApiKey() ) {
        Bugsnag.notify(error, onError)
    }
}