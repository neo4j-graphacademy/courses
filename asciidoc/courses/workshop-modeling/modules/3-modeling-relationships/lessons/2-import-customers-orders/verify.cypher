RETURN COUNT {()-[:PLACED]->()} > 0 AS outcome, 'There must be one or more [:PLACED] relationships in the database. Check your spelling, relationship types are case sensitive.' AS reason
