// reload data
LOAD CSV 
WITH HEADERS 
FROM "https://raw.githubusercontent.com/tomasonjo/blog-datasets/main/survey/responses.csv" AS row  // <3>
CREATE (p:Person) 
SET p = row;

// Set all numbers to floats - solution for 1-dataset/2-import
MATCH (p:Person)
CALL {
  WITH p
  UNWIND keys(p) AS key 
  WITH p, key, toFloat(p[key]) AS value 
  WHERE value IS NOT null
  CALL apoc.create.setProperty(p, key, value) YIELD node 
  RETURN DISTINCT 'done' AS result
} IN TRANSACTIONS OF 100 rows 
RETURN DISTINCT result;