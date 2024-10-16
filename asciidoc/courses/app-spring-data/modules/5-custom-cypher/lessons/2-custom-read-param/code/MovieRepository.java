// tag::find-person-movies[]
interface MovieRepository extends Neo4jRepository<Movie, String> {
    //findMoviesSubset() method

    @Query("MATCH (m:Movie)<-[r:ACTED_IN]-(p:Person {name: $name})" +
            "RETURN m, collect(r), collect(p);")
    Iterable<Movie> findMoviesByPerson(String name);
}
// end::find-person-movies[]