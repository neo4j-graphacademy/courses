// tag::find-movies-subset[]
@RestController
@RequestMapping("/movies")
public class MovieController {
    //repository injection and constructor

    //findAllMovies() now calls the custom query
    @GetMapping()
    Iterable<Movie> findAllMovies() {
        return movieRepo.findMoviesSubset();
    }
}
// end::find-movies-subset[]