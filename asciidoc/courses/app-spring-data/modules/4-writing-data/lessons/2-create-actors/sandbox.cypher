MATCH (p:Person)-[r:ACTED_IN]->(m:Movie {movieId: "9876"})
RETURN *;