MATCH (n:Director)-[r:DIRECTED]->(m:Movie)
CALL apoc.create.relationship(n,
'DIRECTED_' + left(m.released,4),
{},
m ) YIELD rel
RETURN COUNT(*) AS `Number of relationships added`