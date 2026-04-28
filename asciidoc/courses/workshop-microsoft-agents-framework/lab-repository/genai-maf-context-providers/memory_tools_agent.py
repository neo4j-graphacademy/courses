import asyncio

from dotenv import load_dotenv
load_dotenv(override=True)

from pydantic import SecretStr

from llm_provider import get_client

from neo4j_agent_memory import MemoryClient, MemorySettings
from neo4j_agent_memory.integrations.microsoft_agent import (
    Neo4jMicrosoftMemory,
    create_memory_tools,
)

# TODO: Configure MemorySettings and create MemoryClient
# Use await memory_client.connect() to connect

# TODO: Create Neo4jMicrosoftMemory

# TODO: Create memory tools using create_memory_tools()

# TODO: Create an agent with both tools and context_providers

# TODO: Run conversations that test preference saving and recall

# TODO: Close the connection with await memory_client.close()
