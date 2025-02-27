MATCH (n:Movie|Person)
WITH count(n) as nodeCount
UNWIND [
    [nodeCount = 7, "There should be 7 nodes in total."]
] AS row
RETURN row[0] AS outcome, row[1] AS reason