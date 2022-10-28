MATCH (m:Movie) WITH m
WHERE m.imdbRating IS NOT NULL
WITH m
ORDER BY m.imdbRating DESC LIMIT 1

MERGE (u:User {userId: '9f965bf6-7e32-4afb-893f-756f502b2c2a'})
SET u.email = 'graphacademy.favorite@neo4j.com'

MERGE (u)-[r:HAS_FAVORITE]->(m)

RETURN *
