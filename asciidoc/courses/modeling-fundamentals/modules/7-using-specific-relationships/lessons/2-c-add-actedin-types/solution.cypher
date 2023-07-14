// tag::actedin[]
MATCH (n:Actor)-[:ACTED_IN]->(m:Movie)
CALL apoc.merge.relationship(n,
  'ACTED_IN_' + left(m.released,4),
  {},
  {},
  m ,
  {}
) YIELD rel
RETURN count(*) AS `Number of relationships merged`;
// end::actedin[]

// tag::directed[]
MATCH (n:Director)-[r:DIRECTED]->(m:Movie)
CALL apoc.merge.relationship(n,
  'DIRECTED_' + left(m.released,4),
  {},
  {},
  m,
  {}
) YIELD rel
RETURN COUNT(*) AS `Number of relationships added`
// end::directed[]