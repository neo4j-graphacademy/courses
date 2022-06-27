// drop all indexes and constraints
call apoc.schema.assert({},{},true);
// add the movieId constraint
CREATE CONSTRAINT Movie_movieId_uniqueness IF NOT EXISTS ON (x:Movie) REQUIRE x.movieId IS UNIQUE;
CREATE CONSTRAINT Movie_title_released_uniqueness IF NOT EXISTS FOR (x:Movie) REQUIRE (x.title,x.released) IS UNIQUE