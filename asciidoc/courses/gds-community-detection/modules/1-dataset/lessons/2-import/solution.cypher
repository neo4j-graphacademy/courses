// tag::create[]
LOAD CSV // <1>
WITH HEADERS // <2>
FROM "https://raw.githubusercontent.com/tomasonjo/blog-datasets/main/survey/responses.csv" AS row  // <3>
CREATE (p:Person) // <4>
SET p = row // <5>
// end::create[]
;

// tag::set[]
MATCH (p:Person) // <1>
CALL {
  WITH p
  UNWIND keys(p) AS key // <3>
  WITH p, key, toFloat(p[key]) AS value // <4>
  WHERE value IS NOT null
  CALL apoc.create.setProperty(p, key, value) YIELD node // <5>
  RETURN DISTINCT 'done' AS result
} IN TRANSACTIONS OF 100 rows // <2>
RETURN DISTINCT result
// end::set[]
