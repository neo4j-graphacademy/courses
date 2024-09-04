MERGE (p:Person {name: "Emil Eifrem"})
MERGE (m:Movie {title: "The Matrix"})
MERGE (p)-[r:ACTED_IN]->(m)
SET r.role = 'Chief'