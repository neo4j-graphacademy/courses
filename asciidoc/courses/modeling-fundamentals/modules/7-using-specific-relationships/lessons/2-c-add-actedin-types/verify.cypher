MATCH (:Person )-[r:ACTED_IN_1993|ACTED_IN_1992|ACTED_IN_1995|DIRECTED_1992|DIRECTED_1995]-() 
WITH count(r) as rCount
UNWIND [
    [rCount >= 1, "There should be at least 1 specific relationship - ACTED_IN_{year}, DIRECTED_{year}"]
]
AS row

RETURN row[0] AS outcome, row[1] AS reason