// Add Actor label
MATCH (p:Person)-[:ACTED_IN]->()
WITH DISTINCT p SET p:Actor;

// Add Director label
MATCH (p:Person)-[:DIRECTED]->()
WITH DISTINCT p SET p:Director;