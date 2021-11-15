SHOW CONSTRAINTS
YIELD labelsOrTypes, properties
WHERE labelsOrTypes = ['User'] AND properties = ['email']
RETURN count(*) = 1 AS outcome
