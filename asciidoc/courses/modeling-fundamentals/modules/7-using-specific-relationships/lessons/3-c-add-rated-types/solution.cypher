MATCH (n:User)-[r:RATED]->(m:Movie)
CALL apoc.create.relationship(n,
'RATED_' + toString(r.rating),
{},
m ) YIELD rel
RETURN COUNT(*) AS `Number of relationships added`;
MATCH (u:User)-[r:RATED_5]-(m:Movie)
  WHERE m.title = 'Apollo 13'
RETURN u.name as Reviewer