MATCH (d:Director)-[:DIRECTED]-(m)
RETURN 
    d.name AS director,
    ?????? AS numMovies
ORDER BY numMovies DESC LIMIT 5