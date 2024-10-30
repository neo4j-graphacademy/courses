MATCH (p:Person)-[:ACTED_IN]->(m:Movie)
RETURN m.title