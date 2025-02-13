MATCH (p:Person {name: 'Robert Blake'})-[:ACTED_IN??]-(others:Person)
RETURN others.name