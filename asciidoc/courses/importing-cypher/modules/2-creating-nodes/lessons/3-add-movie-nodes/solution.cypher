// Create the Movie node constraint
CREATE CONSTRAINT Movie_movieId
FOR (x:Movie) 
REQUIRE x.movieId IS UNIQUE;

// Load the Movie nodes
LOAD CSV WITH HEADERS
FROM 'https://data.neo4j.com/importing-cypher/movies.csv' AS row
MERGE (m:Movie {movieId: toInteger(row.movieId)})
SET
m.tmdbId = toInteger(row.tmdbId),
m.imdbId = toInteger(row.imdbId),
m.released = row.released,
m.title = row.title,
m.year = row.year,
m.plot = row.plot,
m.budget = row.budget;