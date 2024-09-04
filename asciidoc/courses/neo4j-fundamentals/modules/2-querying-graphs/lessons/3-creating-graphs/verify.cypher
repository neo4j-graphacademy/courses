MATCH (m:Movie)
WHERE m.released >= date('2017-01-01')
RETURN count(*) > 0 AS outcome,
  CASE WHEN count(*) = 0 THEN "We expect at least one movie with a `released` property after 1 January 2017" ELSE null END AS reason