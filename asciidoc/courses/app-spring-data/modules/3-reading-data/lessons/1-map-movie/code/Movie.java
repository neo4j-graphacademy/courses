// tag::movie[]
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


    public Movie(String movieId, String title, String plot, String poster, String url, String imdbId, String tmdbId, String released, Long year, Long runtime, Long budget, Long revenue, Long imdbVotes, Double imdbRating, String[] languages, String[] countries) {
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
    }

    public String getMovieId() {
        return movieId;
    }

    public void setMovieId(String movieId) {
        this.movieId = movieId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getPlot() {
        return plot;
    }

    public void setPlot(String plot) {
        this.plot = plot;
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

    public String getReleased() {
        return released;
    }

    public void setReleased(String released) {
        this.released = released;
    }

    public Long getYear() {
        return year;
    }

    public void setYear(Long year) {
        this.year = year;
    }

    public Long getRuntime() {
        return runtime;
    }

    public void setRuntime(Long runtime) {
        this.runtime = runtime;
    }

    public Long getBudget() {
        return budget;
    }

    public void setBudget(Long budget) {
        this.budget = budget;
    }

    public Long getRevenue() {
        return revenue;
    }

    public void setRevenue(Long revenue) {
        this.revenue = revenue;
    }

    public Long getImdbVotes() {
        return imdbVotes;
    }

    public void setImdbVotes(Long imdbVotes) {
        this.imdbVotes = imdbVotes;
    }

    public Double getImdbRating() {
        return imdbRating;
    }

    public void setImdbRating(Double imdbRating) {
        this.imdbRating = imdbRating;
    }

    public String[] getLanguages() {
        return languages;
    }

    public void setLanguages(String[] languages) {
        this.languages = languages;
    }

    public String[] getCountries() {
        return countries;
    }

    public void setCountries(String[] countries) {
        this.countries = countries;
    }
}
// end::movie[]