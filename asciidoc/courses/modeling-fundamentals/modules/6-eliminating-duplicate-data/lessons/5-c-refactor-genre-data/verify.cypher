MATCH (m:Movie {title: "Apollo 13"})-[:IN_GENRE]->(g:Genre {name: "Drama"})
RETURN m.genres IS NULL AS outcome