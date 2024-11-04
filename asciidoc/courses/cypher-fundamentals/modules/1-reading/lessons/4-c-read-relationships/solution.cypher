MATCH (m:Movie {title: "Cloud Atlas"} )<-[:DIRECTED]-(p:Person)
RETURN p.name