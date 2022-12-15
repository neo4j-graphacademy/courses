MATCH (p:Person)-[:ACTED_IN]->(m:Movie)-[:IN_GENRE]->(g:Genre)
WHERE g.name = 'Comedy'
RETURN count (DISTINCT p.name)