MATCH (m:Movie {movieId: $movieId})
 SET m.imdbVotes = coalesce(m.imdbVotes+1, 1), m.lastUpdated = datetime()
RETURN m;