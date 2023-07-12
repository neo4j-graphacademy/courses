MERGE (m:Movie {
    title: 'Test Solution',
    tmdbId: 1234,
    imdbId: 4321,
    poster: 'string',
    url: 'string',
    revenue: 1234,
    budget: 5678
})
MERGE (p:Person {
    tmdbId: 1234,
    imdbId: 4321,
    poster: 'string',
    url: 'string'
})
MERGE (u:User {id: 'test-user'})
MERGE (u)-[r:RATED]->(m)
SET r.rating = 3
