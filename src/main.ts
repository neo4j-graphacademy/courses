/* tslint:disable */
import { Express } from 'express'
import { Driver } from 'neo4j-driver';
import initApp from './app'
import initNeo4j, { close } from './modules/neo4j';
import initListeners from './listeners'
import { emitter } from './events';
import { AppInit } from './domain/events/AppInit';
import {
    NEO4J_HOST,
    NEO4J_USERNAME,
    NEO4J_PASSWORD,
    PORT,
} from './constants'
import { cacheHTML } from './modules/asciidoc/services/cache-html';

console.log(`Connecting to ${NEO4J_HOST} as ${NEO4J_USERNAME}`);

initNeo4j(NEO4J_HOST, NEO4J_USERNAME, NEO4J_PASSWORD)
    .then((driver: Driver) => initApp(driver))
    .then(async (app: Express) => {
        await initListeners()
        return app
    })
    .then((app: Express) => {
        void cacheHTML()

        return app
    })
    .then((app: Express) => {
        const server = app.listen(PORT || 3000, () => {
            emitter.emit(new AppInit(app, server))
        })
    })
    .catch(e => {
        console.error(e)

        return close()
    })
