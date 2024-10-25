@SpringBootTest
class AppSpringDataApplicationTests {
	final Driver driver;
	public AppSpringDataApplicationTests(@Autowired Driver driver) {
		this.driver = driver;
	}

	@Test
	final void testConnection() {
		driver.verifyConnectivity();
	}
}
