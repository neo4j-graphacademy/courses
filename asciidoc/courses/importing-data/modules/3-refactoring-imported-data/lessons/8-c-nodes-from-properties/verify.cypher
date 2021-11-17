MATCH (m:Movie)-[r:IN_GENRE]->(g:Genre)
return count(r) + count(DISTINCT g) = 229 as outcome