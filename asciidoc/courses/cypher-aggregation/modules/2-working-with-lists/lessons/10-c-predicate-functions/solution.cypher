MATCH p = (a:Actor)-[:ACTED_IN*2]-(a2:Actor)
WHERE
a.name = 'Tom Hanks'
AND any(x IN nodes(p) WHERE x.year = 1995)
RETURN p