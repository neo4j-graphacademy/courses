// drop all indexes and constraints
call apoc.schema.assert({},{},true);
// add the movieId constraint
CREATE CONSTRAINT Movie_movieId_uniqueness IF NOT EXISTS ON (x:Movie) REQUIRE x.movieId IS UNIQUE;
CREATE CONSTRAINT Movie_tmdbId_year_uniqueness IF NOT EXISTS FOR (x:Movie) REQUIRE (x.tmdbId,x.year) IS UNIQUE