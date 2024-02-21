MERGE (s1:Session {id: 'test-1'})
MERGE (s1)-[:HAS_RESPONSE]->(s1r1:Response {
    id: randomUuid(),
    createdAt: datetime(),
    input: 'Who directed The Matrix?',
    rephrasedQuestion: 'Director of The Matrix',
    output: 'The Matrix was directed by The Wachowskis',
    cypher: 'MATCH (p:Person)-[:DIRECTED]->(m:Movie {title: "The Matrix"}) RETURN p.name AS name'
})
MERGE (s1)-[:LAST_RESPONSE]->(s1r1)

MERGE (s3:Session {id: 'test-3'})
MERGE (s3)-[:HAS_RESPONSE]->(r1:Response {
    id: randomUuid(),
    createdAt: datetime(),
    input: 'Who directed Toy Story'
})
MERGE (s3)-[:HAS_RESPONSE]->(r2:Response {
    id: randomUuid(),
    createdAt: datetime(),
    input: 'Who acted in it?'
})
MERGE (s3)-[:HAS_RESPONSE]->(r3:Response {
    id: randomUuid(),
    createdAt: datetime(),
    input: 'What else have the acted in together?'
})
MERGE (s3)-[:LAST_RESPONSE]->(r3)
MERGE (r1)-[:NEXT]->(r2)
MERGE (r2)-[:NEXT]->(r3)

RETURN *