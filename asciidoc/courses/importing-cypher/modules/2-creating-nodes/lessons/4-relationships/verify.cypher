MATCH (p:Person)-[:ACTED_IN]->(m:Movie) RETURN true as outcome LIMIT 1
