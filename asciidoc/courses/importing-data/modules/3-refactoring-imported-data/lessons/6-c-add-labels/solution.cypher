MATCH (p:Person)-[:DIRECTED]->()
WITH DISTINCT p SET p:Director
