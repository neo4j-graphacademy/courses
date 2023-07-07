// Delete All nodes
MATCH (p:Person) DETACH DELETE p;

// Set all numbers to floats - solution for 1-dataset/2-import
MATCH (p:Person)
UNWIND keys(p) AS key
WITH p, key, toFloat(p[key]) AS value
WHERE value IS NOT null
CALL apoc.create.setProperty(p, key, value) YIELD node
RETURN DISTINCT 'done' AS result
