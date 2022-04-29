import initNeo4j, { write } from '../modules/neo4j'

import {
    NEO4J_HOST,
    NEO4J_USERNAME,
    NEO4J_PASSWORD
} from '../constants'


const main = async () => {
    const driver = await initNeo4j(NEO4J_HOST as string, NEO4J_USERNAME as string, NEO4J_PASSWORD as string)

    await write(`
        CALL apoc.periodic.commit("
            MATCH (s:Session)
            WHERE s.createdAt <= datetime() - duration('P7D')
            WITH s LIMIT $batchSize
            DELETE s
            RETURN count(*)
        ", { batchSize: 1000 })
    `)

    await driver.close()
}

main()