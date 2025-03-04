// Modify this query to use the -[:RATED]->()
// relationship to create a new RATED_{rating}
// relationship between the :User and a :Movie
MATCH (n:Actor)-[:ACTED_IN]->(m:Movie)
CALL apoc.merge.relationship(n,
  'ACTED_IN_' + left(m.released,4),
  {},
  {},
  m ,
  {}
) YIELD rel
RETURN count(*) AS `Number of relationships merged`