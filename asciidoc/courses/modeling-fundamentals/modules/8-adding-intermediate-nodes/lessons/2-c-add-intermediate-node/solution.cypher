MATCH (a:Actor)-[r:ACTED_IN]-(m:Movie)
MERGE (x:Role {name: r.role})
MERGE (a)-[:PLAYED]->(x)
MERGE (x)-[:IN_MOVIE]->(m)
SET r.role = null