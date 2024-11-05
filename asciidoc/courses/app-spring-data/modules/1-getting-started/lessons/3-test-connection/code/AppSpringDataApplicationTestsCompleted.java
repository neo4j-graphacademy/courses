import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.neo4j.driver.Driver;
import org.springframework.beans.factory.annotation.Autowired;

@SpringBootTest
class AppSpringDataApplicationTests {
	@Test
	void contextLoads() {
	}

	final Driver driver;

	public AppSpringDataApplicationTests(@Autowired Driver driver) {
		this.driver = driver;
	}

	@Test
	final void testConnection() {
		driver.verifyConnectivity();
	}
}
