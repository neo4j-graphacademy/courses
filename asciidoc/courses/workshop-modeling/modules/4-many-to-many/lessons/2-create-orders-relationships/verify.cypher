RETURN COUNT {()-[:CONTAINS]->()} > 0 AS outcome, 'There must be one or more [:CONTAINS] relationships in the database. Check your spelling, relationship types are case sensitive.' AS reason
