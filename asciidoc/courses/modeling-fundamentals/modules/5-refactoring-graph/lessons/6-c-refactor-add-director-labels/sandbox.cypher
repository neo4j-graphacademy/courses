MATCH (p:Person) 
WHERE exists ((p)-[:ACTED_IN]->()) 
SET p:Actor