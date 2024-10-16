// tag::find-person-movies[]
@RestController
@RequestMapping("/movies")
public class MovieController {
    //repository injection and costructor

    //new method to call the custom `findMoviesByPerson()` method
    @GetMapping("/person")
    Iterable<Movie> findMoviesByPerson(@RequestParam String name) {
        return movieRepo.findMoviesByPerson(name);
    }
}
// end::find-person-movies[]