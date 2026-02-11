RETURN COUNT {()-[:IN_CATEGORY]->()} > 0 AS outcome, 'There must be one or more [:IN_CATEGORY] relationships in the database. Check your spelling, relationship types are case sensitive.' AS reason
