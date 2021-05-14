import 'dotenv/config'
import { Express } from 'express'
import { Driver } from 'neo4j-driver';
import { init } from './app'
import initNeo4j from './modules/neo4j';

const {
    NEO4J_HOST,
    NEO4J_USERNAME,
    NEO4J_PASSWORD,
    PORT,
} = process.env

initNeo4j(<string> NEO4J_HOST, <string> NEO4J_USERNAME, <string> NEO4J_PASSWORD)
    .then((driver: Driver) => {
        return init(driver)
    })
    .then((app: Express) => {
        app.listen(PORT || 3000, () => {
            console.log(`-\n🚀 Listening on http://localhost:3000\n\n`);
        })
    })
    .catch(e => console.error(e))
