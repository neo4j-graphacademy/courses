// Delete All nodes
MATCH (p:Person) DETACH DELETE p;

LOAD CSV WITH HEADERS
FROM "https://raw.githubusercontent.com/tomasonjo/blog-datasets/main/survey/responses.csv" AS row  // <3>
CREATE (p:Person)
SET p = row,
    // Encode Punctuality - Solution for 2-preprocess/3-c-categorical
    p.PunctualityEncoding = CASE p['Punctuality']
    WHEN 'i am often running late' THEN 1
    WHEN 'i am often early' THEN 3
    WHEN 'i am always on time' THEN 5
    ELSE 3 END;

// Set all numbers to floats - solution for 1-dataset/2-import
MATCH (p:Person)
UNWIND keys(p) AS key
WITH p, key, toFloat(p[key]) AS value
WHERE value IS NOT null
CALL apoc.create.setProperty(p, key, value) YIELD node
RETURN DISTINCT 'done' AS result
