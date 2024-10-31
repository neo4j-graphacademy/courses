MATCH (a:Person)-[:ACTED_IN]->(m:Movie)
WHERE 
RETURN a.name