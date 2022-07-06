// drop all indexes and constraints
call apoc.schema.assert({},{},true);
// create uniqueness constraints
CREATE CONSTRAINT Movie_movieId_unique IF NOT EXISTS FOR (x:Movie) REQUIRE x.movieId IS UNIQUE;
CREATE CONSTRAINT Movie_released_title_unique IF NOT EXISTS FOR (x:Movie) REQUIRE (x.released,x.title) IS UNIQUE;
CREATE CONSTRAINT Person_tmdbId_unique IF NOT EXISTS FOR (x:Person) REQUIRE x.tmdbId IS UNIQUE;
CREATE CONSTRAINT User_userId_unique IF NOT EXISTS FOR (x:User) REQUIRE x.userId IS UNIQUE;
CREATE CONSTRAINT Genre_name_unique IF NOT EXISTS FOR (x:Genre) REQUIRE x.name IS UNIQUE;
CREATE CONSTRAINT Person_name_exists IF NOT EXISTS FOR (x:Person) REQUIRE x.name IS NOT NULL;
CREATE CONSTRAINT Movie_title_exists IF NOT EXISTS FOR (x:Movie) REQUIRE x.title IS NOT NULL;
CREATE CONSTRAINT User_name_exists IF NOT EXISTS FOR (x:User) REQUIRE x.name IS NOT NULL;
CREATE CONSTRAINT RATED_timestamp_exists IF NOT EXISTS FOR ()-[x:RATED]-() REQUIRE x.timestamp IS NOT NULL