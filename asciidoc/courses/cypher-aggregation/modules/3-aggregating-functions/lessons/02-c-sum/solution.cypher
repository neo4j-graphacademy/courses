MATCH (u:User)-[r:RATED]-(m:Movie)
WHERE u.name = 'Angela Thompson'
WITH count(m) AS NumMovies, collect(duration.between(datetime({epochseconds:r.timestamp}), date(m.released))) AS ReviewPeriods
UNWIND ReviewPeriods AS x
RETURN NumMovies, sum(x), sum(x)/NumMovies