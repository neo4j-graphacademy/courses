MATCH (p:Person {name: "Emil Eifrem"})-[:ACTED_IN]->(m:Movie)
RETURN m.title