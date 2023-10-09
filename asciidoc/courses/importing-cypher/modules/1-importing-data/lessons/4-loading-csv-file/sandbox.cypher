LOAD CSV WITH HEADERS 
FROM 'https://data.neo4j.com/importing-cypher/people.csv' AS row
RETURN row