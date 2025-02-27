MERGE (s:User {userId: 534}) 
SET s.name = "Sandy Jones"

MERGE (c:User {userId: 105}) 
SET c.name = "Clinton Spencer"