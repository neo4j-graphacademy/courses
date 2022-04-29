// Find an actor that acted in a Movie
MATCH (a:Actor)-[r:ACTED_IN]->(m:Movie)

// Create a Role node
MERGE (x:Role {name: r.role})

// Create the PLAYED
// relationship between the Actor and the Role nodes.
MERGE (a)-[:PLAYED]->(x)

// Create the IN_MOVIE relationship between
// the Role and the Movie nodes.
MERGE (x)-[:IN_MOVIE]->(m)