MATCH (g:Genre)
WITH count(g) as gCount
UNWIND [
    [gCount >= 6, "There should be at least 6 nodes with a `Genre` label"]
]
AS row

RETURN row[0] AS outcome, row[1] AS reason