MATCH (p:Person {name: 'Robert Blake'})-[:ACTED_IN*2]-(others:Person)
RETURN others.name