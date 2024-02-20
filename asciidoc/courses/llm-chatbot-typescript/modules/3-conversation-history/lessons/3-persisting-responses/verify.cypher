OPTIONAL MATCH (s:Session {id: 'test-3'})
WITH s, COUNT {(s)-[:HAS_RESPONSE]->()} AS responses

UNWIND [
  [s is not null, "A (:Session) node should exist with id 'test-3'"],
  [responses > 1, "(:Session {id: 'test-3'}) should have three outgoing [:HAS_RESPONSE] relationships to (:Response) nodes"]
] AS row

RETURN row[0] as outcome, row[1] as reason