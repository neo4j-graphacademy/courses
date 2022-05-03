MATCH (d:Director)-[:DIRECTED]-(m)
RETURN d.name AS Director,
count(*) AS numMovies
ORDER BY numMovies DESC LIMIT 5