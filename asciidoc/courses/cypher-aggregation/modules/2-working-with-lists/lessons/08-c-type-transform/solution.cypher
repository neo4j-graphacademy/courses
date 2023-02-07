MATCH (m:Movie)-[r:RATED]-()
WHERE m.title = 'Toy Story'
WITH collect(r.rating) AS Ratings
WITH Ratings, toIntegerList(Ratings) AS IntegerRatings
UNWIND IntegerRatings as x
WITH x WHERE x = 4
RETURN count(*)