MATCH (p:Person)-[r:ACTED_IN]->(m:Movie)
WHERE ??????
RETURN p.name, r.role, m.title