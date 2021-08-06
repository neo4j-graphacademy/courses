MATCH (m:Movie {title: 'Get Out'})
DETACH DELETE m;
MATCH (m:Movie {title: 'Rocketman'})
DETACH DELETE m;
MATCH (p:Person {name: 'Daniel Kaluuya'})
DETACH DELETE p;