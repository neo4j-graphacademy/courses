MATCH (s:Session {id: 'cypher-retrieval-3'})
RETURN s, [
  (s)-[:HAS_RESPONSE]->(r) | [r,
    [ (r) -[:CONTEXT]->(c) | c ]
  ]
]
