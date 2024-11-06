
// tag::movie-repo[]
import org.springframework.data.neo4j.repository.Neo4jRepository;

interface MovieRepository extends Neo4jRepository<Movie, String> {
}
// end::movie-repo[]