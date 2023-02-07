MATCH ()-[r:RATED]-(m:Movie)
WITH min(r.rating) as LowestRating
MATCH (u:User)-[r:RATED]-(m:Movie)
WHERE r.rating = LowestRating
RETURN u.name, r.rating, m.title