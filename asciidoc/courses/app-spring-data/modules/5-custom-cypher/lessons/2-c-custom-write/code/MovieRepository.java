interface MovieRepository extends Neo4jRepository<Movie, String> {
    //other methods

    @Query("MERGE (m:Movie {movieId: $movie.__id__})" +
            "SET m += $movie.__properties__, m.lastUpdated = datetime()" +
            "RETURN m;")
    Movie saveWithAudit(Movie movie);
}
