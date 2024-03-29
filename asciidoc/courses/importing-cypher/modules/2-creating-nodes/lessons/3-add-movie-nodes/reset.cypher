MATCH (p:Person) DETACH DELETE p;
MATCH (m:Movie) DETACH DELETE m;

DROP CONSTRAINT Movie_movieId IF EXISTS;

CREATE CONSTRAINT Person_tmdbId IF NOT EXISTS
FOR (x:Person) 
REQUIRE x.tmdbId IS UNIQUE;

LOAD CSV WITH HEADERS FROM 'https://data.neo4j.com/importing-cypher/persons.csv' AS row
MERGE (p:Person {tmdbId: toInteger(row.person_tmdbId)})
SET
p.imdbId = toInteger(row.person_imdbId),
p.bornIn = row.bornIn,
p.name = row.name,
p.bio = row.bio,
p.poster = row.poster,
p.url = row.url,
p.born = row.born,
p.died = row.died;
