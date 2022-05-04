CALL gds.graph.project.cypher(
  // Projection name
  'movie-ratings-after-2014',
  // Cypher statement to find all nodes in projection
  '
    MATCH (u:User) RETURN id(u) AS id, labels(u) AS labels
    UNION MATCH (m:Movie) WHERE m.year > 2014 RETURN id(m) AS id, labels(m) AS labels
  ',
  // Cypher statement to find every User that rated a Movie
  // where the rating property is greater than or equal to 4
  // and the movie was released after 2014 (year > 2014)
  '
    MATCH (u:User)-[r:RATED]->(m:Movie)
    WHERE r.rating >= 4 AND m.year > 2014
    RETURN id(u) AS source,
        id(m) AS target,
        r.rating AS rating,
        "RATED" AS type
  '
);