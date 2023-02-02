// clear the graph
MATCH (u:User) DETACH DELETE u;
MATCH (p:Person) DETACH DELETE p;
MATCH (m:Movie) DETACH DELETE m;
MATCH (n) DETACH DELETE n;
// make sure all constraints exist
CREATE CONSTRAINT Genre_name IF NOT EXISTS
FOR (x:Genre)
REQUIRE x.name IS UNIQUE;
CREATE CONSTRAINT Movie_movieId IF NOT EXISTS FOR (x:Movie) REQUIRE x.movieId IS UNIQUE;
CREATE CONSTRAINT Person_tmdbId IF NOT EXISTS FOR (x:Person) REQUIRE x.tmdbId IS UNIQUE;
CREATE CONSTRAINT User_userId IF NOT EXISTS FOR (x:User) REQUIRE x.userId IS UNIQUE;
// import the Movie data
CALL {
LOAD CSV WITH HEADERS
FROM 'https://data.neo4j.com/importing/2-movieData.csv'
AS row
//process only Movie rows
WITH row WHERE row.Entity = "Movie"
MERGE (m:Movie {movieId: row.movieId})
ON CREATE SET
m.tmdbId = row.tmdbId,
m.imdbId = row.imdbId,
m.imdbRating = toFloat(row.imdbRating),
m.released = row.released,
m.title = row.title,
m.year = toInteger(row.year),
m.poster = row.poster,
m.runtime = toInteger(row.runtime),
m.countries = split(coalesce(row.countries,""), "|"),
m.imdbVotes = toInteger(row.imdbVotes),
m.revenue = toInteger(row.revenue),
m.plot = row.plot,
m.url = row.url,
m.budget = toInteger(row.budget),
m.languages = split(coalesce(row.languages,""), "|")
WITH m,split(coalesce(row.genres,""), "|") AS genres
UNWIND genres AS genre
WITH m, genre
MERGE (g:Genre {name:genre})
MERGE (m)-[:IN_GENRE]->(g)
};
// import the Person data
CALL {
LOAD CSV WITH HEADERS
FROM 'https://data.neo4j.com/importing/2-movieData.csv'
AS row
WITH row WHERE row.Entity = "Person"
MERGE (p:Person {tmdbId: row.tmdbId})
ON CREATE SET
p.imdbId = row.imdbId,
p.bornIn = row.bornIn,
p.name = row.name,
p.bio = row.bio,
p.poster = row.poster,
p.url = row.url,
p.born = CASE row.born WHEN "" THEN null ELSE date(row.born) END,
p.died = CASE row.died WHEN "" THEN null ELSE date(row.died) END
};
// set ACTED_IN relationships and Actor labels
CALL {
LOAD CSV WITH HEADERS
FROM 'https://data.neo4j.com/importing/2-movieData.csv'
AS row
WITH row WHERE row.Entity = "Join" AND row.Work = "Acting"
MATCH (p:Person {tmdbId: row.tmdbId})
MATCH (m:Movie {movieId: row.movieId})
MERGE (p)-[r:ACTED_IN]->(m)
ON CREATE
SET r.role = row.role
SET p:Actor
};
// set DIRECTED relationships and Director labels
CALL {
LOAD CSV WITH HEADERS
FROM 'https://data.neo4j.com/importing/2-movieData.csv'
AS row
WITH row WHERE row.Entity = "Join" AND row.Work = "Directing"
MATCH (p:Person {tmdbId: row.tmdbId})
MATCH (m:Movie {movieId: row.movieId})
MERGE (p)-[r:DIRECTED]->(m)
ON CREATE
SET r.role = row.role
SET p:Director
};
// import the User data
CALL {
LOAD CSV WITH HEADERS
FROM 'https://data.neo4j.com/importing/2-ratingData.csv'
AS row
MATCH (m:Movie {movieId: row.movieId})
MERGE (u:User {userId: row.userId})
ON CREATE SET u.name = row.name
MERGE (u)-[r:RATED]->(m)
ON CREATE SET r.rating = toInteger(row.rating),
r.timestamp = toInteger(row.timestamp)
}