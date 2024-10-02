// tag::person[]
@Node
public class Person {
    @Id
    private String imdbId;

    private String tmdbId;
    private String name;
    private String bio;
    private String poster;
    private String url;
    private String bornIn;

    private LocalDate born;
    private LocalDate died;

    //constructor, getters, and setters
}
// end::person[]