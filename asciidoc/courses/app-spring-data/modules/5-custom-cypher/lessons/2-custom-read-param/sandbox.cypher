MATCH (m:Movie)<-[r:ACTED_IN]-(p:Person {name: "Robin Williams"})
RETURN m, collect(r), collect(p);