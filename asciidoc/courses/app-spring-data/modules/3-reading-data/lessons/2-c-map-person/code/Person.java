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

    public Person(String imdbId, String tmdbId, String name, String bio, String poster, String url, String bornIn, LocalDate born, LocalDate died) {
        this.imdbId = imdbId;
        this.tmdbId = tmdbId;
        this.name = name;
        this.bio = bio;
        this.poster = poster;
        this.url = url;
        this.bornIn = bornIn;
        this.born = born;
        this.died = died;
    }

    public String getImdbId() {
        return imdbId;
    }

    public String getTmdbId() {
        return tmdbId;
    }

    public String getName() {
        return name;
    }

    public String getBio() {
        return bio;
    }

    public String getPoster() {
        return poster;
    }

    public String getUrl() {
        return url;
    }

    public String getBornIn() {
        return bornIn;
    }

    public LocalDate getBorn() {
        return born;
    }

    public LocalDate getDied() {
        return died;
    }
}
// end::person[]