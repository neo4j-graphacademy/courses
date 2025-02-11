MATCH (p:Person {name: 'Robert Blake'})-[??????]-(others:Person)
RETURN DISTINCT others.name
