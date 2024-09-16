// tag::find-movies-subset[]
interface MovieRepository extends Neo4jRepository<Movie, String> {
    
    @Query("MATCH (m:Movie)<-[r:ACTED_IN]-(p:Person)" +
            "RETURN m, collect(r), collect(p) LIMIT 20;")
    Iterable<Movie> findMoviesSubset();
}

// end::find-movies-subset[]

// tag::find-person-movies[]
interface MovieRepository extends Neo4jRepository<Movie, String> {
    //findMoviesSubset() method

    @Query("MATCH (m:Movie)<-[r:ACTED_IN]-(p:Person {name: $name})" +
            "RETURN m, collect(r), collect(p);")
    Iterable<Movie> findMoviesByPerson(String name);
}

// end::find-person-movies[]