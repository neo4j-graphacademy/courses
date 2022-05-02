MATCH (m:Movie)<-[ACTED_IN]-(p:Person)
WHERE m.imdbRating IS NOT NULL
RETURN m.title, m.imdbRating, p.name, p.born
ORDER BY m.imdbRating DESC, p.born DESC