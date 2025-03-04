MATCH (u:User) 
WITH count(u) as userCount
UNWIND [
    [userCount >= 2, "There should be at least 2 User nodes"]
]
AS row

RETURN row[0] AS outcome, row[1] AS reason