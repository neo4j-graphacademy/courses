import { Express } from 'express'
import router from './chatbot.routes'
import { CHATBOT_NEO4J_HOST, CHATBOT_NEO4J_PASSWORD, CHATBOT_NEO4J_USERNAME, COHERE_API_KEY, COHERE_API_URL, OPENAI_API_KEY } from '../../constants'
import { initChatbot } from './chatbot.class'
import { createDriver } from '../neo4j'
import { Configuration, OpenAIApi } from 'openai'
import showdown from 'showdown'
import axios from 'axios'

export default async function initChatbotModule(app: Express): Promise<void> {
    // Add routes
    app.use('/api/v1/chatbot/', router)

    // Init Chatbot
    if (COHERE_API_KEY &&
        COHERE_API_URL &&
        OPENAI_API_KEY &&
        CHATBOT_NEO4J_HOST &&
        CHATBOT_NEO4J_USERNAME &&
        CHATBOT_NEO4J_PASSWORD
    ) {
        const driver = await createDriver(CHATBOT_NEO4J_HOST, CHATBOT_NEO4J_USERNAME, CHATBOT_NEO4J_PASSWORD)
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);
        const cohereClient = axios.create({
            baseURL: COHERE_API_URL,
            headers: {
                authorization: `bearer ${COHERE_API_KEY}`
            }
        })
        const converter = new showdown.Converter()

        initChatbot(driver, openai, cohereClient, converter)
    }

}
