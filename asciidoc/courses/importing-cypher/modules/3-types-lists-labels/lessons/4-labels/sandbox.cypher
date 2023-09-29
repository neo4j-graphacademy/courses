MATCH (p:Person)-[:ACTED_IN]->()
WITH DISTINCT p SET p:Actor