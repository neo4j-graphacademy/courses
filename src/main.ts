/* tslint:disable */
import 'dotenv/config'
import { Express } from 'express'
import { Driver } from 'neo4j-driver';
import initApp from './app'
// import { mergeCategories } from './domain/services/asciidoc/merge-categories';
// import { mergeCourses } from './domain/services/asciidoc/merge-courses';
import initNeo4j, { close } from './modules/neo4j';

const {
    NEO4J_HOST,
    NEO4J_USERNAME,
    NEO4J_PASSWORD,
    PORT,
} = process.env

console.log(`Connecting to ${NEO4J_HOST} as ${NEO4J_USERNAME}`);

initNeo4j(NEO4J_HOST as string, NEO4J_USERNAME as string, NEO4J_PASSWORD as string)
    .then((driver: Driver) => initApp(driver))
    .then((app: Express) => {
        app.listen(PORT || 3000, () => {
            // console.clear()
            console.log(`\n\n--\n🚀 Listening on http://localhost:3000\n`);
        })

        // mergeCategories()
        // mergeCourses()
    })
    .catch(e => {
        console.error(e)
        close()
    })
