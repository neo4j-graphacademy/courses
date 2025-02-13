MATCH (m:Movie)<-[:ACTED_IN]-(p:Person)
WHERE p.name = 'Charlie Chaplin'
RETURN m.title AS movie,
// Add CASE clause code here
m.runtime AS runTime