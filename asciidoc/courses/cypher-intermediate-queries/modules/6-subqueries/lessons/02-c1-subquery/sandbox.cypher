MATCH (g:Genre)
?????? { 
    WITH ??????
    MATCH (g)<-[:IN_GENRE]-(m) WHERE m.imdbRating > 9
    RETURN count(m) AS numMovies
}
RETURN g.name AS Genre, numMovies 
ORDER BY numMovies DESC