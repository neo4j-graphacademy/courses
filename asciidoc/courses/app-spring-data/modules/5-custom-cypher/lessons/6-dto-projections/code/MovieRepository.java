interface MovieRepository extends Neo4jRepository<Movie, String> {
    //other methods

    @Query("MATCH (m:Movie)<-[r:ACTED_IN]-(p:Person) " +
            "RETURN m, COUNT(p) AS castSize LIMIT 10;")
    Iterable<MovieDTOProjection> findAllDTOProjectionsWithCustomQuery();
}
