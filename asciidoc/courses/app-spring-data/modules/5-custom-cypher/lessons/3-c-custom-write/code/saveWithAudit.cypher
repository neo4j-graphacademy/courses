MERGE (m:Movie {movieId: $movie.__id__})
 SET m += $movie.__properties__, m.lastUpdated = datetime()
RETURN m;