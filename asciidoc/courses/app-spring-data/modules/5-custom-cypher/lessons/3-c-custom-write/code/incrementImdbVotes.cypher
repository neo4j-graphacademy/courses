MATCH (m:Movie {movieId: $movieId})
 SET m.imdbVotes = coalesce(m.imdbVotes+1, 1)
RETURN m;