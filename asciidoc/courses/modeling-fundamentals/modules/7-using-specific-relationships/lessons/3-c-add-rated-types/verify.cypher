MATCH (:User)-[r:RATED_5|RATED_4|RATED_3|RATED_2|RATED_1]-()
WITH count(r) as rCount
UNWIND [
    [rCount >= 1, "There should be at least 1 specific relationship - RATED_{rating}"]
]
AS row

RETURN row[0] AS outcome, row[1] AS reason