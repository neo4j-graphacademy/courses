/* eslint-disable */
import fs from 'fs'
import path from 'path'
import initNeo4j, { close } from '../modules/neo4j';

import {
    NEO4J_HOST,
    NEO4J_USERNAME,
    NEO4J_PASSWORD
} from '../constants'

if ( !NEO4J_HOST || !NEO4J_USERNAME || !NEO4J_PASSWORD ) {
    console.log('Credentials missing:', {
        NEO4J_HOST,
        NEO4J_USERNAME,
        NEO4J_PASSWORD,
    });

    throw new Error(`neo4j credentials not defined`)
}

initNeo4j(NEO4J_HOST as string, NEO4J_USERNAME as string, NEO4J_PASSWORD as string)
    .then(async driver => {
        const constraintFile = path.join(__dirname, '..', '..', 'cypher', 'constraints.cypher')

        const constraints = fs.readFileSync(constraintFile).toString()
            .split(';')
            .map(cypher => cypher.trim())
            .filter(e => e !== '')

        const session = driver.session()

        let count = 0

        while ( constraints.length ) {
            const cypher: string = constraints.pop() as string

            await session.run(cypher)

            count++
        }

        await close()

        return count
    })
    .then(count => {
        console.log(`🔎 Created ${count} constraints on ${NEO4J_HOST}`);
    })
