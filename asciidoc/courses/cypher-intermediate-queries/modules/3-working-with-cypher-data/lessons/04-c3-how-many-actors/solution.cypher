MATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
RETURN 
    m.title AS movie,
    collect(a.name) AS actors,
    size(collect(a.name)) AS num
ORDER BY size(actors) DESC
LIMIT 100