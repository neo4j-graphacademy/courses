SHOW INDEXES
YIELD name
WHERE name="answers" 
RETURN count(*)=1 as outcome