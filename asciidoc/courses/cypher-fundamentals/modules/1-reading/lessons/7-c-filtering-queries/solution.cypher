MATCH (p:Person)-[:ACTED_IN]->(m:Movie)
WHERE m.title = 'As Good as It Gets' AND p.born > 1960
RETURN p.name