
// tag::person-controller[]
import java.util.Optional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/people")
public class PersonController {
    private final PersonRepository personRepo;

    public PersonController(PersonRepository personRepo) {
        this.personRepo = personRepo;
    }

    @GetMapping()
    Iterable<Person> findAllPeople() {
        return personRepo.findAll();
    }

    @GetMapping("/{imdbId}")
    Optional<Person> findPersonById(@PathVariable String imdbId) {
        return personRepo.findById(imdbId);
    }
}
// end::person-controller[]