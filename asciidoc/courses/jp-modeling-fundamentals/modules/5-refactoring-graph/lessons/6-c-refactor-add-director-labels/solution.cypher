MATCH (p:Person)
WHERE exists ((p)-[:DIRECTED]-())
SET p:Director