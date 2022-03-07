MATCH (u:User {email: "graphacademy.favorite@neo4j.com"})-[:HAS_FAVORITE]->(:Movie {title: 'Toy Story'})
RETURN true AS outcome