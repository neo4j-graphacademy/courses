import dotenv from 'dotenv'
import initNeo4j from '../modules/neo4j';
import { mergeCourses } from '../domain/services/asciidoc/merge-courses';
import { mergeCategories } from '../domain/services/asciidoc/merge-categories';

dotenv.config()

/* tslint:disable-next-line */
// console.clear();

const {
    NEO4J_HOST,
    NEO4J_USERNAME,
    NEO4J_PASSWORD
} = process.env

initNeo4j(NEO4J_HOST as string, NEO4J_USERNAME as string, NEO4J_PASSWORD as string)
    .then(() => mergeCourses())
    .then(() => mergeCategories())
