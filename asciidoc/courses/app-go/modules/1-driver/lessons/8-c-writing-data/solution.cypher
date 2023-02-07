MATCH (m:Movie { title: "Matrix, The" })
CREATE (p:Person { name: "Some Person" })
CREATE (p)-[:ACTED_IN]->(m);
