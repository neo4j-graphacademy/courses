CALL apoc.periodic.iterate(
  "MATCH (u:User)-[r:RATED]->(m:Movie) RETURN  left(toString(m.year),2) AS rY, id(r) AS rId",
  "MATCH ()-[r:RATED]->()  WHERE id(r) = rId SET r.ratingY = rY",
  {batchSize:1000});

 CREATE  INDEX RATED_ratingY IF NOT EXISTS FOR ()-[x:RATED]-() ON (x.ratingY);

 CREATE  TEXT INDEX RATED_ratingY_text IF NOT EXISTS FOR ()-[x:RATED]-() ON (x.ratingY)