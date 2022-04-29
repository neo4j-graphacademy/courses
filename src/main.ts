/* tslint:disable */
import { Express } from 'express'
import { Driver } from 'neo4j-driver';
import initApp from './app'
import initNeo4j, { close } from './modules/neo4j';
import initListeners from './listeners'
import { emitter } from './events';
import { AppInit } from './domain/events/AppInit';
import { cacheHTML } from './domain/services/asciidoc/cache-html';

import {
    NEO4J_HOST,
    NEO4J_USERNAME,
    NEO4J_PASSWORD,
    PORT,
} from './constants'

console.log(`Connecting to ${NEO4J_HOST} as ${NEO4J_USERNAME}`);

initNeo4j(NEO4J_HOST as string, NEO4J_USERNAME as string, NEO4J_PASSWORD as string)
    .then((driver: Driver) => initApp(driver))
    .then((app: Express) => {
        initListeners(app)
        return app
    })
    .then((app: Express) => {
        const server = app.listen(PORT || 3000, () => {
            emitter.emit(new AppInit(app, server))
        })


        // Cache Asciidoc into HTML
        cacheHTML()
    })
    .catch(e => {
        console.error(e)
        close()
    })
