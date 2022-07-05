MATCH (a:Person)-[:ACTED_IN]->(m:Movie)
RETURN a.name, a.born