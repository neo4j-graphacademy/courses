MERGE (u:User {userId: '1185150b-9e81-46a2-a1d3-eb649544b9c4'})
SET u.email = 'graphacademy.reviewer@neo4j.com'
MERGE (m:Movie {tmdbId: '769'})
MERGE (u)-[r:RATED]->(m)
SET r.rating = 5,
    r.timestamp = timestamp()
RETURN m {
    .*,
    rating: r.rating
} AS movie
