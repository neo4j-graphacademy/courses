CALL gds.graph.project.cypher(
  // Projection name
  'movie-ratings-after-2014',
  // Cypher statement to find all nodes in projection
  'MATCH ...',
  // Cypher statement to find every User that rated a Movie
  // where the rating property is greater than or equal to 4
  // and the movie was released after 2014 (year > 2014)
  'MATCH (u:User)-[r:RATED]->(m:Movie)
   WHERE ...
   RETURN id(u) AS source , id(m) AS target, count(*) AS actedWithCount, "RATED" AS type'
);
