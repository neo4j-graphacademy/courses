OPTIONAL MATCH (s:Session {id: 'agent-rag-1'})
OPTIONAL MATCH (s)-[:HAS_RESPONSE]->(r)
WITH s, r, [ (r)-[:CONTEXT]->(c) | c.title ] AS titles ORDER BY r.createdAt DESC LIMIT 1

UNWIND [
  [s is not null, 'A session with the id `agent-rag-1` should exist in the database'],
  [r is not null, 'A `(:Response)` should be related to the session'],
  [r is not null and count{ (r)-[:CONTEXT]->() } > 0,
    'Each `(:Response)` node should have at least one outgoing `:CONTEXT` relationship'
  ]
] AS row

RETURN row[0] AS outcome, row[1] AS reason
