MATCH (p:Person)-[:ACTED_IN]->(m:Movie)<-[r:RATED]-(:User)
WHERE p.name = 'Tom Hanks'
WITH m, avg(r.rating) AS avgRating
RETURN m.title AS Movie, avgRating AS `AverageRating`
ORDER BY avgRating DESC