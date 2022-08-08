import { Express } from 'express'
import Bugsnag, { OnErrorCallback } from '@bugsnag/js'
import BugsnagPluginExpress from '@bugsnag/plugin-express'
import Neo4jError from '../errors/neo4j.error'
import { User } from '../domain/model/user'

export function initBugsnag() {
    if (bugsnagApiKey()) {
        Bugsnag.start({
            apiKey: process.env.BUGSNAG_API_KEY as string,
            plugins: [BugsnagPluginExpress],
            onError: event => {
                event.errors.map(error => {
                    if (error instanceof Neo4jError) {
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
    if (!bugsnagApiKey()) return;

    const plugin = Bugsnag.getPlugin('express')

    if (plugin) {
        app.use(plugin.requestHandler)
    }
}

export function useErrorHandler(app: Express) {
    if (!bugsnagApiKey()) return;

    const plugin = Bugsnag.getPlugin('express')

    if (plugin) {
        app.use(plugin.errorHandler)
    }
}

export function notify(error: Error, onError?: OnErrorCallback) {
    if (bugsnagApiKey()) {
        Bugsnag.notify(error, onError)
    }
}

export function notifyPossibleRequestError(e: any, user: User | undefined) {
    notify(e, event => {
        event.setUser(user?.sub, user?.email, user?.name)

        if (e.request) {
            event.addMetadata('request', {
                data: e.request.data,
                headers: e.request.headers,
                status: e.request.status,
                statusText: e.request.statusText,
            })
        }

        if (e.response) {
            event.addMetadata('response', {
                data: e.response.data,
                headers: e.response.headers,
                status: e.response.status,
                statusText: e.response.statusText,
            })
        }
    })
}
