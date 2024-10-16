MATCH (p:Person)-[r:ACTED_IN]->(m:Movie {title: "Night at the Museum: Secret of the Tomb"})
RETURN m.title, p.name, r.role;