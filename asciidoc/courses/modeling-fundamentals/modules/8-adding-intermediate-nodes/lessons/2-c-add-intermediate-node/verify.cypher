MATCH (a:Actor)-[r:ACTED_IN]-(m:Movie)
WITH * ORDER BY rand() LIMIT 1
MATCH (a)-[:PLAYED]->(role)-[:IN_MOVIE]->(m)
RETURN role.name = r.role AS outcome;