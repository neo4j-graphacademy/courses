MATCH (p:Person {name: 'Daniel Kaluuya'})-[:ACTED_IN]->(m:Movie {title: 'Get Out'}) 
RETURN true AS outcome