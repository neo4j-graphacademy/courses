MATCH (m:Movie) 
WHERE "German" IN m.languages
RETURN count(m)