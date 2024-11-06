MATCH (m:Movie {movieId: "9876"})<-[r]-(p:Person)
DETACH DELETE p, m;