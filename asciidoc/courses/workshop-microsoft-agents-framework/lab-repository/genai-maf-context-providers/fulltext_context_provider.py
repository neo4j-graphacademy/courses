import asyncio

from dotenv import load_dotenv
load_dotenv(override=True)

from llm_provider import get_client
from agent_framework_neo4j import Neo4jContextProvider, Neo4jSettings

# Load Neo4j settings from environment
neo4j_settings = Neo4jSettings()

# TODO: Create a Neo4jContextProvider with fulltext search
# Use index_type="fulltext" and neo4j_settings for connection details

# TODO: Create an agent with the context provider
# Use OpenAIResponsesClient and client.as_agent()

# TODO: Run a query and print the response
