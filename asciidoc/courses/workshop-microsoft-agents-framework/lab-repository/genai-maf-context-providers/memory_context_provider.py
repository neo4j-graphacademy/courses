import asyncio

from dotenv import load_dotenv
load_dotenv(override=True)

from pydantic import SecretStr

from llm_provider import get_client

from neo4j_agent_memory import MemoryClient, MemorySettings
from neo4j_agent_memory.integrations.microsoft_agent import (
    Neo4jMicrosoftMemory,
)

# TODO: Configure MemorySettings with Neo4j connection details

# TODO: Create a MemoryClient, connect with await memory_client.connect()

# TODO: Create Neo4jMicrosoftMemory from the memory client

# TODO: Create an agent with memory.context_provider

# TODO: Run a multi-turn conversation and search memory contents

# TODO: Close the connection with await memory_client.close()
