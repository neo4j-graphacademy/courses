
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Optional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
// tag::import[]
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestParam;
// end::import[]

@RestController
@RequestMapping("/movies")
public class MovieController {
    private final MovieRepository movieRepo;

    public MovieController(MovieRepository movieRepo) {
        this.movieRepo = movieRepo;
    }

    @GetMapping()
    Iterable<Movie> findAllMovies() {
        return movieRepo.findMoviesSubset();
    }

    @GetMapping("/{movieId}")
    Optional<Movie> findMovieById(@PathVariable String movieId) {
        return movieRepo.findById(movieId);
    }

    @PostMapping("/save")
    Movie save(@RequestBody Movie movie) {
        return movieRepo.save(movie);
    }

    // tag::delete-method[]
    @DeleteMapping("/delete")
    void delete(@RequestParam String movieId) {
        movieRepo.deleteById(movieId);
        System.out.println("Deleted movie with movieId: " + movieId);
    }
    // end::delete-method[]
}
