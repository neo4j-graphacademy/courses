MATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
RETURN 
    m.title AS movie,
    ??????(a.name) AS actors
ORDER BY ??????(actors) DESC
LIMIT 100