@RestController
@RequestMapping("/movies")
public class MovieController {
    //other repository injection, constructor, and methods

    @PostMapping("/saveaudit")
    Movie saveWithAudit(@RequestBody Movie movie) {
        return movieRepo.saveWithAudit(movie);
    }
}
