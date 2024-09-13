import initNeo4j, { write } from "../modules/neo4j"

import {
  NEO4J_HOST,
  NEO4J_USERNAME,
  NEO4J_PASSWORD
} from '../constants'

const main = async () => {
  const [new_id, old_id, property] = process.argv.reverse()

  if (['id', 'email'].includes(property)) {
    const driver = await initNeo4j(NEO4J_HOST, NEO4J_USERNAME, NEO4J_PASSWORD)
    console.log(`Connected to ${NEO4J_HOST} as ${NEO4J_USERNAME}`);

    const res = await write<{ count: number, id: string }>(`
      MATCH (new:User {${property}: $new_id})
      MATCH (old:User {${property}: $old_id})-[r:HAS_ENROLMENT]->(e)
      DELETE r
      MERGE (new)-[:HAS_ENROLMENT]->(e)
      RETURN count(*) AS count, new.id AS id

    `, { property, old_id, new_id })

    console.log(`\n😩 ${res.records?.map(el => el.get('count')).join('') || 0} enrolments transferred`)
    console.log(`     -- Old Profile: https://graphacademy.neo4j.com/u/${old_id}/`)
    console.log(`     -- New Profile: https://graphacademy.neo4j.com/u/${new_id}/`)
    console.log('')
    if (res.records.length) {
      const id = res.records[0].get('id')
      console.log(`Your enrolments have been transferred to your new public profile at https://graphacademy.neo4j.com/u/${id}/`)

    }

    await driver.close()
  }
}

// eslint-disable-next-line
main()
