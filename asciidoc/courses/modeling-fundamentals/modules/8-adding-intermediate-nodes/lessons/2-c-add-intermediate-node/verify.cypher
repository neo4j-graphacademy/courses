MATCH (role:Role)
WITH count(role) as rCount
UNWIND [
    [rCount >= 1, "There should be at least 1 node with a Role label."]
]
AS row

RETURN row[0] AS outcome, row[1] AS reason