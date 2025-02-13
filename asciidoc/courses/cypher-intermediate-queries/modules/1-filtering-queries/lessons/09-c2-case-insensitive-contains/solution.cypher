MATCH (p:Person)-[r:ACTED_IN]->(m:Movie)
WHERE toLower(r.role) CONTAINS "dog"
RETURN p.name, r.role, m.title