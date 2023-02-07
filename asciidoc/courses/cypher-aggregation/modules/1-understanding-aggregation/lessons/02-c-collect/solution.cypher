MATCH (m)<-[:ACTED_IN]-(a:Person)
WITH  m, collect(a.name) AS Actors
WHERE size(Actors) <= 2
RETURN m.title AS Movie, m.year as Year, Actors ORDER BY m.year