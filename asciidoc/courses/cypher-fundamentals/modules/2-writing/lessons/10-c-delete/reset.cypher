MERGE (m:Movie {title: "The Matrix"})
MERGE (e:Person {name: "Emil Eifrem"})
SET e.born = 1978
MERGE (e)-[:ACTED_IN]->(m)