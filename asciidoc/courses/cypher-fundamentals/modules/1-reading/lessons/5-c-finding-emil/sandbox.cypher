MATCH (:Person)-[:ACTED_IN]->(m:Movie)
RETURN  m.title