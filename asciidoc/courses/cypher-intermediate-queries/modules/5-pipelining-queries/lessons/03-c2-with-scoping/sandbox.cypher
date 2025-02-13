WITH 'Tom Hanks' AS theActor
MATCH (p:Person)-[:ACTED_IN]->(m:Movie)
WHERE p.name = theActor
AND m.revenue IS NOT NULL
WITH ??????, ?????? ORDER BY m.revenue DESC LIMIT 1
RETURN theActor, m.title AS title, m.revenue AS revenue