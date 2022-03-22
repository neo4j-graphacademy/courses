MATCH (u:User {email: "graphacademy.reviewer@neo4j.com"})-[r:RATED]->(m:Movie {title: 'Pulp Fiction'})
RETURN r.rating = 5 AS outcome