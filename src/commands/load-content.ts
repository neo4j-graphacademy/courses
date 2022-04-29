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

initNeo4j(NEO4J_HOST as string, NEO4J_USERNAME as string, NEO4J_PASSWORD as string)
    .then(() => mergeCourses())
    .then(() => mergeCategories())
    .then(() => close())
