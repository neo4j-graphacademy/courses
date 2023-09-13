MATCH (Person)-[r:ACTED_IN]->(Movie) DELETE r;
MATCH (Person)-[r:DIRECTED]->(Movie) DELETE r;

MATCH (p:Person) DELETE p;
MATCH (m:Movie) DELETE m;

DROP CONSTRAINT Person_tmdbId IF EXISTS;
DROP CONSTRAINT Movie_movieId IF EXISTS;

CREATE CONSTRAINT Person_tmdbId
FOR (x:Person) 
REQUIRE x.tmdbId IS UNIQUE;

CREATE CONSTRAINT Movie_movieId
FOR (x:Movie) 
REQUIRE x.movieId IS UNIQUE;

LOAD CSV WITH HEADERS 
FROM "https://data.neo4j.com/importing-cypher/persons.csv" 
AS row
MERGE (p:Person {tmdbId: toInteger(row.person_tmdbId)})
SET
p.imdbId = toInteger(row.person_imdbId),
p.bornIn = row.bornIn,
p.name = row.name,
p.bio = row.bio,
p.poster = row.poster,
p.url = row.url,
p.born = date(row.born),
p.died = date(row.died);

LOAD CSV WITH HEADERS
FROM 'https://data.neo4j.com/importing-cypher/movies.csv'
AS row
MERGE (m:Movie {movieId: toInteger(row.movieId)})
SET
m.tmdbId = toInteger(row.tmdbId),
m.imdbId = toInteger(row.imdbId),
m.released = date(row.released),
m.title = row.title,
m.year = toInteger(row.year),
m.plot = row.plot,
m.budget = toInteger(row.budget),
m.imdbRating = toFloat(row.imdbRating),
m.poster = row.poster,
m.runtime = toInteger(row.runtime),
m.imdbVotes = toInteger(row.imdbVotes),
m.revenue = toInteger(row.revenue),
m.url = row.url,
m.countries = split(row.countries, '|'),
m.languages = split(row.languages, '|');

LOAD CSV WITH HEADERS
FROM 'https://data.neo4j.com/importing-cypher/acted_in.csv' AS row
MATCH (p:Person {tmdbId: toInteger(row.person_tmdbId)})
MATCH (m:Movie {movieId: toInteger(row.movieId)})
MERGE (p)-[r:ACTED_IN]->(m)
SET r.role = row.role;

LOAD CSV WITH HEADERS
FROM 'https://data.neo4j.com/importing-cypher/directed.csv'
AS row
MATCH (p:Person {tmdbId: toInteger(row.person_tmdbId)})
MATCH (m:Movie {movieId: toInteger(row.movieId)})
MERGE (p)-[r:DIRECTED]->(m);

MATCH (p:Person)-[:ACTED_IN]->()
WITH DISTINCT p SET p:Actor;

MATCH (p:Person)-[:DIRECTED]->()
WITH DISTINCT p SET p:Director;