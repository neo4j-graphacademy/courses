MATCH (a:Person)-[:ACTED_IN]->(m:Movie)
WHERE m.title = 'As Good as It Gets' AND a.born > 1960
RETURN a.name