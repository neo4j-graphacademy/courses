MATCH (p:Person)
SET p.born = CASE p.born WHEN "" THEN null ELSE date(p.born) END
WITH p
SET p.died = CASE p.died WHEN "" THEN null ELSE date(p.died) END