@RestController
@RequestMapping("/movies")
public class MovieController {
    //other methods

    @GetMapping("/dtocast")
    Iterable<MovieDTOProjection> findAllMovieDTOProjections() { 
        return movieRepo.findAllDTOProjectionsWithCustomQuery();
    }
}
