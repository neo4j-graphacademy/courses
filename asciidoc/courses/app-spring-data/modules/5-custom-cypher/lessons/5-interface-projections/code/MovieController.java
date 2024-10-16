@RestController
@RequestMapping("/movies")
public class MovieController {
    //other methods

    @GetMapping("/movielist")
    Iterable<MovieProjection> findAllMovieProjections() { 
        return movieRepo.findAllMovieProjectionsBy(); 
    }
}
