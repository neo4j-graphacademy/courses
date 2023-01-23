MATCH (u:User {email: "graphacademy.flag@neo4j.com"})-[:HAS_FAVORITE]->(:Movie {title: 'Band of Brothers'})
RETURN true AS outcome