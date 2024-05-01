OPTIONAL MATCH (s:Session {id: 'vector-retriever-1'})
OPTIONAL MATCH (s)-[:HAS_RESPONSE]->(r)
WITH s, r ORDER BY r.createdAt DESC LIMIT 1

UNWIND [
  [s is not null, 'A session with the id `vector-retriever-1` should exist in the database'],
  [r is not null, 'A `(:Response)` should be related to the session'],
  [r is not null and count{ (r)-[:CONTEXT]->() } > 0,
    'Each `(:Response)` node should have at least one outgoing `:CONTEXT` relationship'
  ]
] AS row

RETURN row[0] AS outcome, row[1] AS reason
