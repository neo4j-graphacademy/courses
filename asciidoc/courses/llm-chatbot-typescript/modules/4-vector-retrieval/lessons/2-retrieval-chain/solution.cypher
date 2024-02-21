MATCH (m:Movie) WITH m LIMIT 1
MERGE (s:Session {id: 'vector-retriever-1'})
MERGE (r:Response {id: 'vector-retriever-1-response'})) SET r:FromSolution
MERGE (s)-[:HAS_RESPONSE]->(r)
MERGE (r)-[:CONTEXT]->(m)
