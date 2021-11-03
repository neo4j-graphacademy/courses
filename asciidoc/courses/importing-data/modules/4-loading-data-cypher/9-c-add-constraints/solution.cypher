// Note: this could be a problem when we use it as reset.cypher at beginning of next challenge due to multi-statement?
CREATE CONSTRAINT Person_tmdbId ON (p:Person) ASSERT p.tmdbId IS UNIQUE;
CREATE CONSTRAINT Movie_tmdbId ON (m:Movie) ASSERT m.tmdbId IS UNIQUE;
CREATE CONSTRAINT Movie_movieId ON (m:Movie) ASSERT m.movieId IS UNIQUE;
CREATE CONSTRAINT Genre_name ON (g:Genre) ASSERT g.name IS UNIQUE;
CREATE CONSTRAINT User_userId ON (u:User) ASSERT u.userId IS UNIQUE
