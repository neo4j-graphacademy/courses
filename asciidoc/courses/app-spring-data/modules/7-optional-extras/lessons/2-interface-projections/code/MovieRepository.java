interface MovieRepository extends Neo4jRepository<Movie, String> {
    //other methods

    Iterable<MovieProjection> findAllMovieProjectionsBy();
}
