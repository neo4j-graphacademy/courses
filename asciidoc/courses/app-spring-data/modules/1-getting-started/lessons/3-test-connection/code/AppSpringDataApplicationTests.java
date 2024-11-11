
// tag::import[]
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.neo4j.driver.Driver;
import org.springframework.beans.factory.annotation.Autowired;
// end::import[]

@SpringBootTest
class AppSpringDataApplicationTests {
    // tag::driver-injection[]
    // Driver injection
    final Driver driver;
    // end::driver-injection[]

    public AppSpringDataApplicationTests(@Autowired Driver driver) {
        this.driver = driver;
    }

    // tag::test-connection[]
    // Test connection
    @Test
    final void testConnection() {
        driver.verifyConnectivity();
    }
    // end::test-connection[]
}
