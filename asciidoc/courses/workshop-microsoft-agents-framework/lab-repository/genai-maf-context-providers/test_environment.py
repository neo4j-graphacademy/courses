# This will test the environment to ensure that the .env file is set up
# correctly and that the OpenAI and Neo4j connections are working.
import os
import unittest

from dotenv import load_dotenv, find_dotenv
load_dotenv(override=True)

class TestEnvironment(unittest.TestCase):

    skip_env_variable_tests = True
    skip_openai_test = True
    skip_neo4j_test = True

    def test_env_file_exists(self):
        env_file_exists = True if find_dotenv() > "" else False
        if env_file_exists:
            TestEnvironment.skip_env_variable_tests = False
        self.assertTrue(env_file_exists, ".env file not found.")

    def env_variable_exists(self, variable_name):
        self.assertIsNotNone(
            os.getenv(variable_name),
            f"{variable_name} not found in .env file")

    def test_llm_variables(self):
        if TestEnvironment.skip_env_variable_tests:
            self.skipTest("Skipping LLM env variable test")

        provider = os.getenv('LLM_PROVIDER', 'openai').lower()
        if provider == 'azure':
            self.env_variable_exists('AZURE_OPENAI_API_KEY')
            self.env_variable_exists('AZURE_OPENAI_ENDPOINT')
        else:
            self.env_variable_exists('OPENAI_API_KEY')
        TestEnvironment.skip_openai_test = False

    def test_neo4j_variables(self):
        if TestEnvironment.skip_env_variable_tests:
            self.skipTest("Skipping Neo4j env variables test")

        self.env_variable_exists('NEO4J_URI')
        self.env_variable_exists('NEO4J_USERNAME')
        self.env_variable_exists('NEO4J_PASSWORD')
        TestEnvironment.skip_neo4j_test = False

    def test_llm_connection(self):
        if TestEnvironment.skip_openai_test:
            self.skipTest("Skipping LLM connection test")

        provider = os.getenv('LLM_PROVIDER', 'openai').lower()

        if provider == 'azure':
            from openai import AzureOpenAI, AuthenticationError

            llm = AzureOpenAI(
                api_key=os.getenv('AZURE_OPENAI_API_KEY'),
                azure_endpoint=os.getenv('AZURE_OPENAI_ENDPOINT'),
                api_version=os.getenv('AZURE_OPENAI_API_VERSION', '2025-03-01-preview'),
            )

            try:
                models = llm.models.list()
            except AuthenticationError:
                models = None
            self.assertIsNotNone(
                models,
                "Azure OpenAI connection failed. Check AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT in .env file.")
        else:
            from openai import OpenAI, AuthenticationError

            llm = OpenAI()

            try:
                models = llm.models.list()
            except AuthenticationError:
                models = None
            self.assertIsNotNone(
                models,
                "OpenAI connection failed. Check the OPENAI_API_KEY key in .env file.")

    def test_neo4j_connection(self):

        msg = "Neo4j connection failed. Check the NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD values in .env file."
        connected = False

        if TestEnvironment.skip_neo4j_test:
            self.skipTest("Skipping Neo4j connection test")

        from neo4j import GraphDatabase

        driver = GraphDatabase.driver(
            os.getenv('NEO4J_URI'),
            auth=(os.getenv('NEO4J_USERNAME'),
                  os.getenv('NEO4J_PASSWORD'))
        )
        try:
            driver.verify_connectivity()
            try:
                driver.execute_query("RETURN true")
                connected = True

            except Exception as e:
                msg = "Neo4j database query failed. Check the NEO4J_URI value in .env file."

        except Exception as e:
            msg = "Neo4j verify connection failed. Check the NEO4J_URI, NEO4J_USERNAME, and NEO4J_PASSWORD values in .env file."

        driver.close()

        self.assertTrue(
            connected,
            msg
            )

def suite():
    suite = unittest.TestSuite()
    suite.addTest(TestEnvironment('test_env_file_exists'))
    suite.addTest(TestEnvironment('test_llm_variables'))
    suite.addTest(TestEnvironment('test_neo4j_variables'))
    suite.addTest(TestEnvironment('test_llm_connection'))
    suite.addTest(TestEnvironment('test_neo4j_connection'))
    return suite

if __name__ == '__main__':
    runner = unittest.TextTestRunner()
    runner.run(suite())
