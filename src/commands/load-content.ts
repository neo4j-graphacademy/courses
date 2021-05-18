import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import initNeo4j, { write, close } from '../modules/neo4j';
import { mergeContent } from '../domain/services/merge-content';


dotenv.config()

console.clear();

const {NEO4J_HOST,
    NEO4J_USERNAME,
    NEO4J_PASSWORD
} = process.env

initNeo4j(<string> NEO4J_HOST, <string> NEO4J_USERNAME, <string> NEO4J_PASSWORD)
    .then(() => mergeContent())
