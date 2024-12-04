@RelationshipProperties
public class Role {
    @RelationshipId
    private String id;

    private String role;

    @TargetNode
    private final Person person;

    public Role(String id, String role, Person person) {
        this.id = id;
        this.role = role;
        this.person = person;
    }

    public String getId() {
        return id;
    }

    public String getRole() {
        return role;
    }

    public Person getPerson() {
        return person;
    }
}
