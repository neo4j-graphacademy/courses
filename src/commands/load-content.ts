/* tslint:disable:no-console */
import initNeo4j, { close } from '../modules/neo4j';
import { mergeCourses } from '../domain/services/asciidoc/merge-courses';
import { mergeCategories } from '../domain/services/asciidoc/merge-categories';

/* tslint:disable-next-line */
// console.clear();

import {
    NEO4J_HOST,
    NEO4J_USERNAME,
    NEO4J_PASSWORD
} from '../constants'

if ( !NEO4J_HOST || !NEO4J_USERNAME || !NEO4J_PASSWORD ) {
    /* tslint:disable-next-line */
    console.log('Credentials missing:', {
        NEO4J_HOST,
        NEO4J_USERNAME,
        NEO4J_PASSWORD,
    });

    throw new Error(`neo4j credentials not defined`)
}

const start = Date.now()

initNeo4j(NEO4J_HOST as string, NEO4J_USERNAME as string, NEO4J_PASSWORD as string)
    .then(() => mergeCourses())
    .then(() => mergeCategories())
    .then(() => close())
    .then(() => {
        const end = Date.now()

        console.log(`⌚️ Completed in ${end-start}ms`)
    })
