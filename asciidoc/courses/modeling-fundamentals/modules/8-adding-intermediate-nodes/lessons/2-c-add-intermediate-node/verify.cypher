MATCH (a:Actor)-[r:ACTED_IN]-(m:Movie)
WHERE r.role IS NOT NULL
WITH count(r) AS removedCount
MATCH (x:Role)
WHERE x.name IN ['Jim Lovell','Sam Baldwin','Annie Reed','Bobby Ciaro','Jimmy Hoffa']
WITH removedCount, count(x) AS countRoles
MATCH (a)-[r1:PLAYED]->(x)
WITH removedCount, countRoles, count(r1) as countPlayed
WITH removedCount, countRoles, countPlayed
MATCH (x)-[r2:IN_MOVIE]->(m)
WITH removedCount, countRoles, countPlayed, count(r2) AS countInMovie
RETURN (removedCount + countRoles + countPlayed + countInMovie) = 15 AS outcome