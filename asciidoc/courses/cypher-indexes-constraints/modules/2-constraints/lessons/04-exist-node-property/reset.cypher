// drop all indexes and constraints
call apoc.schema.assert({},{},true);
CREATE CONSTRAINT Movie_movieId_uniqueness IF NOT EXISTS ON (x:Movie) ASSERT x.movieId IS UNIQUE;
CREATE CONSTRAINT Movie_year_title_uniqueness IF NOT EXISTS FOR (x:Movie) REQUIRE (x.year,x.title) IS UNIQUE;
CREATE CONSTRAINT Person_tmdbId_uniqueness IF NOT EXISTS ON (x:Person) REQUIRE x.tmdbId IS UNIQUE;
CREATE CONSTRAINT User_userId_uniqueness IF NOT EXISTS ON (x:User) REQUIRE x.userId IS UNIQUE;
CREATE CONSTRAINT Genre_name_uniqueness IF NOT EXISTS ON (x:Genre) REQUIRE x.name IS UNIQUE