WITH  'Tom Hanks' AS theActor
MATCH (p:Person)-[:ACTED_IN]->(m:Movie)
WHERE p.name = theActor
AND m.revenue IS NOT NULL
WITH m ORDER BY m.revenue DESC LIMIT 1
RETURN m.revenue AS revenue, m.title AS title