// tag::role-property[]
@RelationshipProperties
public class Role {
    @RelationshipId
    private String id;

    private String role;

    @TargetNode
    private final Person person;

    //constructor, getters, and setters
}
// end::role-property[]