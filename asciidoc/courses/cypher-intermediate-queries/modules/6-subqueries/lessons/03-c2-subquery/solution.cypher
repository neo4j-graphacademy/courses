MATCH (m:Movie)<-[:ACTED_IN]-(p:Person)
WHERE m.year = 2015
RETURN "Actor" AS type,
p.name AS workedAs,
collect(m.title) AS movies
UNION ALL
MATCH (m:Movie)<-[:DIRECTED]-(p:Person)
WHERE m.year = 2015
RETURN "Director" AS type,
p.name AS workedAs,
collect(m.title) AS movies