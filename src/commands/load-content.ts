/* eslint-disable */
import initNeo4j, { close } from '../modules/neo4j';
import { mergeCourses } from '../services/merge-courses';
import { mergeCategories } from '../services/merge-categories';

import {
    NEO4J_HOST,
    NEO4J_USERNAME,
    NEO4J_PASSWORD,
    ASCIIDOC_DIRECTORY
} from '../constants'

if (!NEO4J_HOST || !NEO4J_USERNAME || !NEO4J_PASSWORD) {
    console.log('Credentials missing:', {
        NEO4J_HOST,
        NEO4J_USERNAME,
        NEO4J_PASSWORD,
    });

    throw new Error(`neo4j credentials not defined`)
}

const start = Date.now()

console.log(`Connected to ${NEO4J_HOST} as ${NEO4J_USERNAME}`);
console.log(`Loading content from ${ASCIIDOC_DIRECTORY}`);


initNeo4j(NEO4J_HOST as string, NEO4J_USERNAME as string, NEO4J_PASSWORD as string)
    .then(() => mergeCourses())
    .then(() => mergeCategories())
    .then(() => close())
    .then(() => {
        const end = Date.now()

        console.log(`⌚️ Completed in ${end - start}ms`)
    })
