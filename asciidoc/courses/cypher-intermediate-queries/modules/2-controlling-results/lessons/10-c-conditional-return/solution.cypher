MATCH (m:Movie)<-[:ACTED_IN]-(p:Person)
WHERE p.name = 'Charlie Chaplin'
RETURN m.title AS Movie,
CASE
WHEN m.runtime < 120 THEN "Short"
WHEN m.runtime >= 120 THEN "Long"
ELSE "Unknown"
END AS Runtime