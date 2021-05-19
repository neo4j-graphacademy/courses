import dotenv from 'dotenv'
import initNeo4j from '../modules/neo4j';
import { mergeCourses } from '../domain/services/asciidoc/merge-courses';
import { mergeCategories } from '../domain/services/asciidoc/merge-categories';

dotenv.config()

console.clear();

const {
    NEO4J_HOST,
    NEO4J_USERNAME,
    NEO4J_PASSWORD
} = process.env

initNeo4j(<string> NEO4J_HOST, <string> NEO4J_USERNAME, <string> NEO4J_PASSWORD)
    .then(() => mergeCourses())
    .then(() => mergeCategories())
