show indexes yield name, type, labelsOrTypes, properties
where name = 'test-index'
RETURN count(*) = 1 AS outcome, CASE WHEN count(*) = 0 THEN 'The database is missing the `test-index` index created in the second test.  Try running the tests again.' ELSE null END as reason