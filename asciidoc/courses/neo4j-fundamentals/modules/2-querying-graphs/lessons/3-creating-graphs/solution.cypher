MERGE (m:Movie {title: "Arthur the King", released: date("2024-03-15")})
MERGE (u:User {name: "Your Name"})
MERGE (u)-[r:RATED]->(m)
SET r.rating = 5