MATCH (m:Movie {title: 'Cloud Atlas'})<-[:DIRECTED]-(p)
RETURN count(p) AS answer