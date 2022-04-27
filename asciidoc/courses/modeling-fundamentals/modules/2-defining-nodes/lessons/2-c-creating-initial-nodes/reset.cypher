MATCH (p:Person) WHERE p.name IN ['Tom Hanks', 'Meg Ryan', 'Danny DeVito', 'Jack Nicholson']
DETACH DELETE p

WITH distinct true AS done


MATCH (m:Movie) WHERE m.title IN ['Apollo 13', 'Sleepless in Seattle', 'Hoffa']
DETACH DELETE m