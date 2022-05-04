MATCH (p:Person)-[:DIRECTED]->(m:Movie)
WHERE p.name = 'Rob Reiner'
AND NOT exists {(p)-[:ACTED_IN]->(m)}
RETURN DISTINCT m.title