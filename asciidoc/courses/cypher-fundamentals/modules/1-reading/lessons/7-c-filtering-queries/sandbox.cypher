MATCH (p:Person)-[:ACTED_IN]->(m:Movie)
WHERE 
RETURN p.name