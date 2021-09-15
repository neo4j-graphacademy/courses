MATCH (g:Genre)
WITH count(g) AS gcount
MATCH (:Genre)-[r:IN_GENRE]-()
WITH count(r) + gcount AS tcount
RETURN tcount = 16  AS outcome