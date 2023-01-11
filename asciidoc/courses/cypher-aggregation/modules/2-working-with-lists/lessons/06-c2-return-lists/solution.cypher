// here is a solution for answering the question
MATCH path = (u:User {name: 'Catherine Trujillo'})-[:RATED*2]-()
WITH  nodes(path) AS n
UNWIND n AS x
WITH  x WHERE x:User AND x.name <> 'Catherine Trujillo'
RETURN DISTINCT  x.name

// If you profile this query,  you will see that it does not perform as efficiently as this:

MATCH path = (u:User {name: 'Catherine Trujillo'})-[:RATED]-()-[:RATED]-(u2:User)
RETURN DISTINCT  u2.name

// Using `nodes()` on paths and unwinding may not always be the best solution