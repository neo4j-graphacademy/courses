MERGE (p:Person {name: 'Daniel Kaluuya'})
MERGE (m:Movie {title: 'Get Out'})
REMOVE m.tagline, m.released
MERGE (p)-[:ACTED_IN]->(m)