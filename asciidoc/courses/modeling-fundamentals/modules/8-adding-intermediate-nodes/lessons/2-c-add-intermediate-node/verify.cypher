MATCH (a:Actor)-[:PLAYED]->(role:Role)-[:IN_MOVIE]->(m:Movie),
    (a)-[r:ACTED_IN]->(m)
WITH * LIMIT 1
RETURN role.name = r.role AS outcome;
