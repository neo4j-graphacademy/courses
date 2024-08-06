/* eslint-disable */
import initNeo4j, { close } from '../modules/neo4j';

import {
  NEO4J_HOST,
  NEO4J_USERNAME,
  NEO4J_PASSWORD,
  ASCIIDOC_DIRECTORY
} from '../constants'
import buildHtml from '../services/build-html';

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
  .then(() => buildHtml())
  .then(() => {
    const end = Date.now()

    console.log(`⌚️ Completed in ${end - start}ms`)
  })
  .catch(e => {
    console.log(`❌ Error loading courses: ${e.message}`);
    console.log(e.stack);
  })
  .finally(() => close())
