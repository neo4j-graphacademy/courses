@SpringBootTest
class AppSpringDataApplicationTests {
    //Driver injection

    @Test
    final void testConnection() {
        driver.verifyConnectivity();
    }
}
