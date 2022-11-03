MATCH (m:Movie {title: "The Matrix"})
CREATE (p:Person {name: "Some Person"})
CREATE (p)-[:ACTED_IN]->(m);
