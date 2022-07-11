// drop all indexes and constraints
call apoc.schema.assert({},{},true);
// create uniqueness constraints
CREATE CONSTRAINT Movie_movieId_unique IF NOT EXISTS FOR (x:Movie) REQUIRE x.movieId IS UNIQUE;
CREATE CONSTRAINT Person_tmdbId_unique IF NOT EXISTS FOR (x:Person) REQUIRE x.tmdbId IS UNIQUE;
CREATE CONSTRAINT User_userId_unique IF NOT EXISTS FOR (x:User) REQUIRE x.userId IS UNIQUE;
CREATE CONSTRAINT Genre_name_unique IF NOT EXISTS FOR (x:Genre) REQUIRE x.name IS UNIQUE;
CREATE CONSTRAINT Person_name_exists IF NOT EXISTS FOR (x:Person) REQUIRE x.name IS NOT NULL;
CREATE CONSTRAINT Movie_title_exists IF NOT EXISTS FOR (x:Movie) REQUIRE x.title IS NOT NULL;
CREATE CONSTRAINT User_name_exists IF NOT EXISTS FOR (x:User) REQUIRE x.name IS NOT NULL;
CREATE CONSTRAINT Movie_imdbId_nodekey IF NOT EXISTS FOR (x:Movie) REQUIRE x.imdbId IS NODE KEY;
CREATE INDEX Movie_title IF NOT EXISTS FOR (x:Movie) ON (x.title);
CREATE INDEX Person_name IF NOT EXISTS FOR (x:Person) ON (x.name);
CREATE INDEX RATED_rating IF NOT EXISTS FOR ()-[x:RATED]-() ON (x.rating);
CREATE INDEX Movie_year_runtime IF NOT EXISTS FOR (x:Movie) ON (x.year, x.runtime);
CREATE INDEX Movie_year_imdbRating IF NOT EXISTS FOR (x:Movie) ON (x.year, x.imdbRating)