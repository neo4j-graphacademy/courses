import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.neo4j.driver.Driver;
import org.springframework.beans.factory.annotation.Autowired;

@SpringBootTest
class AppSpringDataApplicationTests {
    // Driver injection
    final Driver driver;

    public AppSpringDataApplicationTests(@Autowired Driver driver) {
        this.driver = driver;
    }

    // Test connection
    @Test
    final void testConnection() {
        driver.verifyConnectivity();
    }
}
