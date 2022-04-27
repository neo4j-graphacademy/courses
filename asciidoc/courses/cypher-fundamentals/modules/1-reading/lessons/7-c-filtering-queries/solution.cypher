MATCH (a:Person)-[:ACTED_IN]->(m:Movie)
WHERE m.title = 'The Matrix' AND a.born > 1960
RETURN a.name, a.born