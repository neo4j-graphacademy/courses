MATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.year = 2000
AND a.born IS NOT NULL
WITH a ORDER BY a.born
WITH collect(DISTINCT a) AS Actors
RETURN head(Actors).name, head(Actors).born