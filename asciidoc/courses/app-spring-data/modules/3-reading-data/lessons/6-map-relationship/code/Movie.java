import org.springframework.data.annotation.Id;
import org.springframework.data.neo4j.core.schema.Node;
// tag::import[]
import org.springframework.data.neo4j.core.schema.Relationship;
import java.util.List;
// end::import[]

@Node
public class Movie {
    @Id
    private String movieId;

    private String title;
    private String plot;
    private String poster;
    private String url;
    private String imdbId;
    private String tmdbId;
    private String released;

    private Long year;
    private Long runtime;
    private Long budget;
    private Long revenue;
    private Long imdbVotes;

    private Double imdbRating;

    private String[] languages;
    private String[] countries;

    // tag::relationship[]
    @Relationship(value = "ACTED_IN", direction = Relationship.Direction.INCOMING)
    // end::relationship[]
    // tag::actor_field[]
    private List<Person> actors;
    // end::actor_field[]

    public Movie(String movieId, String title, String plot, String poster, String url, String imdbId, String tmdbId,
            String released, Long year, Long runtime, Long budget, Long revenue, Long imdbVotes, Double imdbRating,
            String[] languages, String[] countries, List<Person> actors) {
        this.movieId = movieId;
        this.title = title;
        this.plot = plot;
        this.poster = poster;
        this.url = url;
        this.imdbId = imdbId;
        this.tmdbId = tmdbId;
        this.released = released;
        this.year = year;
        this.runtime = runtime;
        this.budget = budget;
        this.revenue = revenue;
        this.imdbVotes = imdbVotes;
        this.imdbRating = imdbRating;
        this.languages = languages;
        this.countries = countries;
        this.actors = actors;
    }

    public String getMovieId() {
        return movieId;
    }

    public String getTitle() {
        return title;
    }

    public String getPlot() {
        return plot;
    }

    public String getPoster() {
        return poster;
    }

    public String getUrl() {
        return url;
    }

    public String getImdbId() {
        return imdbId;
    }

    public String getTmdbId() {
        return tmdbId;
    }

    public String getReleased() {
        return released;
    }

    public Long getYear() {
        return year;
    }

    public Long getRuntime() {
        return runtime;
    }

    public Long getBudget() {
        return budget;
    }

    public Long getRevenue() {
        return revenue;
    }

    public Long getImdbVotes() {
        return imdbVotes;
    }

    public Double getImdbRating() {
        return imdbRating;
    }

    public String[] getLanguages() {
        return languages;
    }

    public String[] getCountries() {
        return countries;
    }

    public void setCountries(String[] countries) {
        this.countries = countries;
    }

    // tag::getter[]
    public List<Person> getActors() {
        return actors;
    }

    public void setActors(List<Person> actors) {
        this.actors = actors;
    }
    // end::getter[]
}
