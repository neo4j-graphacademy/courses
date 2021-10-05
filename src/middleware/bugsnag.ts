import { Express } from 'express'
import Bugsnag from '@bugsnag/js'
import BugsnagPluginExpress from '@bugsnag/plugin-express'

export function initBugsnag() {
    if ( bugsnagApiKey() ) {
        Bugsnag.start({
            apiKey: process.env.BUGSNAG_API_KEY as string,
            plugins: [ BugsnagPluginExpress ],
            onError: event => {
                event.errors.map((error: any) => {
                    if ( error.query !== undefined )  {
                        event.addMetadata('query', {
                            query: error.query,
                            parameters: error.parameters,
                            database: error.database,
                        })
                    }

                    if ( error.user !== undefined )  {
                        event.addMetadata('user', {
                            sub: error.user,
                        })
                    }

                    if ( error.requestId !== undefined )  {
                        event.addMetadata('innerRequest', {
                            requestId: error.requestId,
                            response: error.response,
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
        app.use( plugin!.errorHandler )
    }
}

export function notify(error: Error) {

    console.log(error);


    if ( bugsnagApiKey() ) {
        Bugsnag.notify(error)
    }
}