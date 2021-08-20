MERGE (p:Person {name: 'Daniel Kaluuya'})
WITH p
MATCH (m:Movie {title: 'Get Out'})
DETACH DELETE m