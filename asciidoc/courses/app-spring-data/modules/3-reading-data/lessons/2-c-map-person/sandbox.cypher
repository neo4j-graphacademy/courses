MATCH (p:Person)
WITH p LIMIT 1
RETURN apoc.meta.cypher.types(p);