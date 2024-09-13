// tag::movie-actors[]
@Node
public class Movie {
    //id and other field definitions

    @Relationship(value = "ACTED_IN", direction = Relationship.Direction.INCOMING)
    private List<Person> actors;

    //constructor, getters, and setters
    
    public Person getActors() {
        return actors;
    }
    public void setActors(Person actors) {
        this.actors = actors;
    }
}
// end::movie-actors[]