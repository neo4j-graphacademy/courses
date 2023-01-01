MERGE (u:User {email: "authenticated@neo4j.com"})
SET u.authenticatedAt = datetime()
