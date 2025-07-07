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
    CHATBOT_NEO4J_HOST,
    CHATBOT_NEO4J_DATABASE,
    SANDBOX_URL,
} from './constants'
import { cacheHTML } from './modules/asciidoc/services/cache-html';
import initChatbot from './modules/chatbot/chatbot.agent';

console.log(`Connecting to ${NEO4J_HOST} as ${NEO4J_USERNAME}`);

if (SANDBOX_URL) {
    console.log(`[sandbox] using URL: ${SANDBOX_URL}`);
}

initNeo4j(NEO4J_HOST, NEO4J_USERNAME, NEO4J_PASSWORD)
    .then((driver: Driver) => initApp(driver))
    .then(async (app: Express) => {
        await initListeners()
        return app
    })
    .then(async (app: Express) => {
        const chatbot = await initChatbot(app)

        if (chatbot) {
            console.log(`Chatbot initialized using ${CHATBOT_NEO4J_HOST}/${CHATBOT_NEO4J_DATABASE}`)
        } else {
            console.log('Chatbot not initialized')
        }

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
