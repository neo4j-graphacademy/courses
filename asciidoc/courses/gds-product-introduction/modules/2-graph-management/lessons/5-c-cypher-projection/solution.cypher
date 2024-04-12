MATCH (source:User)-[r:RATED]->(target:Movie)
WHERE target.year > 2014
WITH gds.graph.project(
  'movie-ratings-after-2014', 
  source, 
  target
) AS g
RETURN g
