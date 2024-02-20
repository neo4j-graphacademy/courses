MATCH (s:Session)-[r:HAS_MESSAGE]->(m)
WHERE s.id in ['test-1', 'test-2', 'test-3']
RETURN *