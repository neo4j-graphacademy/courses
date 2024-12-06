MATCH (p:Person)-[r:ACTED_IN]->(m:Movie)
WHERE p.name = 'Emil Eifrem'
RETURN p.name AS person, m.title AS title, r.role AS role