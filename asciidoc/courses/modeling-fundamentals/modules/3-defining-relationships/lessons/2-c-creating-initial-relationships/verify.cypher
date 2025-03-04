MATCH (:Person)-[r]->(:Movie)
WITH count(r) as rCount
UNWIND [
    [rCount >= 6, "There should be at least 6 relationships"]
]
AS row

RETURN row[0] AS outcome, row[1] AS reason