MATCH (:User)-[r:RATED]->(:Movie)
WITH count(r) as rCount
UNWIND [
    [rCount >= 5, "There should be at least 5 RATED relationships"]
]
AS row

RETURN row[0] AS outcome, row[1] AS reason