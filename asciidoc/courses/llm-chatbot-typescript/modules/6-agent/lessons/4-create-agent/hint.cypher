MATCH (s:Session {id: 'agent-rag-1'})
RETURN s, [
  (s)-[:HAS_RESPONSE]->(r) | [r,
    [ (r) -[:CONTEXT]->(c) | c ]
  ]
]
