MATCH (m:Movie)-[:IN_LANGUAGE]-(l:Language)
  WHERE  l.name = 'Italian'
RETURN m.title