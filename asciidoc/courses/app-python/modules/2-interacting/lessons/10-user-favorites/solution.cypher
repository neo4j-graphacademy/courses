MERGE (u:User {userId: '9f965bf6-7e32-4afb-893f-756f502b2c2a'})
SET u.email = 'graphacademy.favorite@neo4j.com'

MERGE (m:Movie {tmdbId: '862'})
SET m.title = 'Toy Story'

MERGE (u)-[r:HAS_FAVORITE]->(m)

RETURN *
