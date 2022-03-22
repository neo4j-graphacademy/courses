MATCH (u:User {email: 'graphacademy.register@neo4j.com'})
RETURN
    (u.email = 'graphacademy.register@neo4j.com' AND u.name = 'Graph Academy' AND u.password <> 'letmein') AS outcome