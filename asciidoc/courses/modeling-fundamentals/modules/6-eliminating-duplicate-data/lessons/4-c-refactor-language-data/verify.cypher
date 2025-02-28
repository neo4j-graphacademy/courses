MATCH (l:Language)
WITH count(l) as lCount
UNWIND [
    [lCount >= 3, "There should be at least 3 nodes with a `Language` label"]
]
AS row

RETURN row[0] AS outcome, row[1] AS reason