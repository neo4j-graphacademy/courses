MATCH (r:Movie {title: 'Rocketman'})
DETACH DELETE r
MERGE (p:Person {name: 'Daniel Kaluuya'})
MERGE (m:Movie {title: 'Get Out'})
SET m.tagline = 'Gripping, scary, witty and timely!'
SET m.released = 2017
MERGE (p)-[:ACTED_IN]->(m);