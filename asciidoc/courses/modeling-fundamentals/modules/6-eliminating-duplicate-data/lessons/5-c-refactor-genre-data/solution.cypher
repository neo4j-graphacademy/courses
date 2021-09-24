MATCH (p:Actor)-[:ACTED_IN]-(m:Movie)-[:IN_GENRE]-(g:Genre)
  WHERE p.name = 'Tom Hanks' AND
  g.name = 'Drama'
RETURN m.title AS Movie