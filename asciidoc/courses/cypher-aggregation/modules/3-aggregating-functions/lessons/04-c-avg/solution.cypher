MATCH (u:User)-[r:RATED]-(m:Movie)
WITH u, count(r) AS NumReviews
WITH collect(NumReviews) AS ReviewCounts
UNWIND ReviewCounts AS x
RETURN toInteger(avg(x))