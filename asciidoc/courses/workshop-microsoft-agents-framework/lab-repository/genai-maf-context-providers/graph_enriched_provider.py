import asyncio

from dotenv import load_dotenv
load_dotenv(override=True)

from llm_provider import get_client, get_embedder
from agent_framework_neo4j import Neo4jContextProvider, Neo4jSettings

# Load settings from environment
neo4j_settings = Neo4jSettings()

# TODO: Define a retrieval query (Cypher) that traverses relationships
# after vector search. The query receives `node` and `score` variables.
# Example traversal: Movie -> IN_GENRE -> Genre, Person -> ACTED_IN -> Movie

# TODO: Create an embedder

# TODO: Create a Neo4jContextProvider with the retrieval_query parameter

# TODO: Create an agent and run a query
