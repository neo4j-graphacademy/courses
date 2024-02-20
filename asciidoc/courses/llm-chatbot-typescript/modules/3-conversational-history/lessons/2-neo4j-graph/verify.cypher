OPTIONAL MATCH (t:DriverTest {working: true})
RETURN t IS NOT NULL as outcome,
  CASE WHEN t is NULL THEN 'The test should have created a :DriverTest node in your database.  Did the test succeed?' ELSE null END
  AS reason