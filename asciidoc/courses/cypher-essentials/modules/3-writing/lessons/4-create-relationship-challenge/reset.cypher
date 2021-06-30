MERGE (:Person {name: 'Daniel Kaluuya'});
MATCH (m:Movie {title: 'Get Out'})
DETACH DELETE m