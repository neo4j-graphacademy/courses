import asyncio
import os

from dotenv import load_dotenv
load_dotenv(override=True)

from pydantic import SecretStr

from neo4j_agent_memory import MemoryClient, MemorySettings
from neo4j_agent_memory.integrations.microsoft_agent import (
    Neo4jMicrosoftMemory,
)

settings = MemorySettings(
    neo4j={
        "uri": os.environ["NEO4J_URI"],
        "username": os.environ["NEO4J_USERNAME"],
        "password": SecretStr(os.environ["NEO4J_PASSWORD"]),
    },
)

# TODO: Create a MemoryClient, connect with await memory_client.connect()

# TODO: Create Neo4jMicrosoftMemory from the memory client

# TODO: Use record_agent_trace() to record an agent execution trace
# Include: task description, tool_calls list, outcome, and success flag

# TODO: Use StreamingTraceRecorder to record a trace in real-time
# Use start_step(), record_tool_call(), and add_observation()

# TODO: Use get_similar_traces() to find similar past tasks

# TODO: Use memory_client.reasoning.get_tool_stats() to view tool statistics

# TODO: Close the connection with await memory_client.close()
