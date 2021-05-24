import 'dotenv/config'
import { Express } from 'express'
import { Driver } from 'neo4j-driver';
import initApp from './app'
import { UserCompletedLesson } from './domain/events/UserCompletedLesson';
import { UserCompletedModule } from './domain/events/UserCompletedModule';
import { UserEnrolled } from './domain/events/UserEnrolled';
import { mergeCategories } from './domain/services/asciidoc/merge-categories';
import { mergeCourses } from './domain/services/asciidoc/merge-courses';
import { emitter } from './events';
import initNeo4j, { close } from './modules/neo4j';

const {
    NEO4J_HOST,
    NEO4J_USERNAME,
    NEO4J_PASSWORD,
    PORT,
} = process.env

console.log(`Connecting to ${NEO4J_HOST} as ${NEO4J_USERNAME}`);

emitter.on<UserEnrolled>(UserEnrolled, e => console.log('UserEnrolled', e))
emitter.on<UserCompletedModule>(UserCompletedModule, e => console.log('UserCompletedModule', e))
emitter.on<UserCompletedLesson>(UserCompletedLesson, e => console.log('UserCompletedLesson', e))

initNeo4j(<string> NEO4J_HOST, <string> NEO4J_USERNAME, <string> NEO4J_PASSWORD)
    .then((driver: Driver) => initApp(driver))
    .then((app: Express) => {
        app.listen(PORT || 3000, () => {
            console.clear()
            console.log(`\n\n--\n🚀 Listening on http://localhost:3000\n`);
        })

        mergeCategories()
        mergeCourses()
    })
    .catch(e => {
        console.error(e)
        close()
    })
