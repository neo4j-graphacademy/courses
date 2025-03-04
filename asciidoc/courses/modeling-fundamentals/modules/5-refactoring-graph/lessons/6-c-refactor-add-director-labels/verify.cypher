MATCH (d:Director)
WITH count(d) as dCount
UNWIND [
    [dCount >= 2, "There should be at least 2 nodes with a `Director` label"]
]
AS row

RETURN row[0] AS outcome, row[1] AS reason