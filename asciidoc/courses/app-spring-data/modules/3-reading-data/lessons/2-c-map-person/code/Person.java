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

    public void setImdbId(String imdbId) {
        this.imdbId = imdbId;
    }

    public String getTmdbId() {
        return tmdbId;
    }

    public void setTmdbId(String tmdbId) {
        this.tmdbId = tmdbId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getPoster() {
        return poster;
    }

    public void setPoster(String poster) {
        this.poster = poster;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getBornIn() {
        return bornIn;
    }

    public void setBornIn(String bornIn) {
        this.bornIn = bornIn;
    }

    public LocalDate getBorn() {
        return born;
    }

    public void setBorn(LocalDate born) {
        this.born = born;
    }

    public LocalDate getDied() {
        return died;
    }

    public void setDied(LocalDate died) {
        this.died = died;
    }
}
// end::person[]