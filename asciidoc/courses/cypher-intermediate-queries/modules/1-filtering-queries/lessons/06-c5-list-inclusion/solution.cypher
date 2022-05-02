MATCH (p:Director)-[:DIRECTED]->(m:Movie)<-[:ACTED_IN]-(p)
WHERE "German" IN m.languages
return p.name, labels(p), m.title