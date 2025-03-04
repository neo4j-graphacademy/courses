MATCH (a:Actor)
WITH count(a) as aCount
UNWIND [
    [aCount >= 4, "There should be at least 4 nodes with an `Actor` label"]
]
AS row

RETURN row[0] AS outcome, row[1] AS reason