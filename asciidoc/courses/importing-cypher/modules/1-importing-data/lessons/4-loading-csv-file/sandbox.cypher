LOAD CSV WITH HEADERS 
FROM 'https://data.neo4j.com/importing-cypher/people.csv' 
as row
RETURN row