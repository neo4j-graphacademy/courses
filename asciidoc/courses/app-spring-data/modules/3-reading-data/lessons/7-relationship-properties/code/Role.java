
// tag::import[]
import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;
// end::import[]

// tag::annotation[]
@RelationshipProperties
// end::annotation[]
public class Role {
    // tag::role-properties[]
    @RelationshipId
    private String id;

    private String role;

    @TargetNode
    private final Person person;
    // end::role-properties[]

    // tag::boilerplate[]
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
    // end::boilerplate[]
}