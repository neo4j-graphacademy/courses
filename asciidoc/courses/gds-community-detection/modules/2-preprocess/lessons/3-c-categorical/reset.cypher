LOAD CSV
WITH HEADERS
FROM "https://raw.githubusercontent.com/tomasonjo/blog-datasets/main/survey/responses.csv" AS row

CREATE (p:Person)
SET p = row
WITH p
UNWIND keys(p) AS key
WITH p, key, toFloat(p[key]) AS value
WHERE value IS NOT null
CALL apoc.create.setProperty(p, key, value) YIELD node
RETURN DISTINCT 'done' AS result;