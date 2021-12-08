MATCH (u:User {email: 'authenticated@neo4j.com'})
RETURN u.authenticatedAt >= datetime() - duration('PT24H') AS outcome