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

    @DeleteMapping("/delete")
    void delete(@RequestParam String movieId) {
        movieRepo.deleteById(movieId);
        System.out.println("Deleted movie with movieId: " + movieId);
    }

    @GetMapping("/person")
    Iterable<Movie> findMoviesByPerson(@RequestParam String name) {
        return movieRepo.findMoviesByPerson(name);
    }

    @PutMapping("/updateVotes")
    Movie updateVotes(@RequestParam String movieId) {
        return movieRepo.incrementImdbVotes(movieId);
    }

    @GetMapping("/movielist")
    Iterable<MovieProjection> findAllMovieProjections() { return movieRepo.findAllMovieProjectionsBy(); }
}