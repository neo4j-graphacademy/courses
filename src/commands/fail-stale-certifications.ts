import initNeo4j, { write } from "../modules/neo4j"

import {
    NEO4J_HOST,
    NEO4J_USERNAME,
    NEO4J_PASSWORD
} from '../constants'


const main = async () => {
    const driver = await initNeo4j(NEO4J_HOST, NEO4J_USERNAME, NEO4J_PASSWORD)

    const res = await write(`
        MATCH (e:Enrolment)-[:FOR_COURSE]->(c:Certification)
        WHERE e.createdAt <= datetime() - duration('PT1H') and not e:CompletedEnrolment and not e:FailedEnrolment
        WITH e LIMIT 1000
        SET e:FailedEnrolment, e.failedAt = e.createdAt + duration('PT1H'), e.failedReason = 'timeout'
        RETURN count(*) AS count
    `)

    console.log(`\n😩 ${res.records[0]?.get('count') || 0} certifications marked as failed`)

    await driver.close()
}

// eslint-disable-next-line
main()
