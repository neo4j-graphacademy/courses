MATCH (p:Person {name: 'Daniel Kaluuya'}) DETACH DELETE p
WITH distinct true AS status

MATCH (m:Movie) WHERE m.title IN ['Get Out', 'Rocketman'] DETACH DELETE m