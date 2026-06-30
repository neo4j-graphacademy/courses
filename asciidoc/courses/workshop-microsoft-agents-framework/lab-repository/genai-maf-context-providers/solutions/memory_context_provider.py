import asyncio
import os

from dotenv import load_dotenv
load_dotenv(override=True)

from pydantic import SecretStr

from llm_provider import get_client, get_provider

from neo4j_agent_memory import MemoryClient, MemorySettings
from neo4j_agent_memory.integrations.microsoft_agent import (
    Neo4jMicrosoftMemory,
)

# tag::settings[]
# Configure memory settings with Neo4j connection
if get_provider() == "azure":
    llm_model = os.getenv("AZURE_OPENAI_RESPONSES_DEPLOYMENT_NAME", "gpt-5-mini")
else:
    llm_model = os.getenv("OPENAI_RESPONSES_MODEL_ID", "gpt-5-mini")

settings = MemorySettings(
    neo4j={
        "uri": os.environ["NEO4J_URI"],
        "username": os.environ["NEO4J_USERNAME"],
        "password": SecretStr(os.environ["NEO4J_PASSWORD"]),
    },
    extraction={
        "enable_gliner": False,  # GLiNER disabled: downloads ~500MB model from HuggingFace, impractical in a workshop
        "llm_model": llm_model,
        "llm_temperature": 1.0,  # gpt-5-mini only supports temperature=1.0
    },
)
# end::settings[]

# tag::memory[]
async def main():
    memory_client = MemoryClient(settings)
    await memory_client.connect()

    try:
        # Create unified memory interface
        session_id = "movie-chat-session"

        memory = Neo4jMicrosoftMemory.from_memory_client(
            memory_client=memory_client,
            session_id=session_id,
            include_short_term=True,
            include_long_term=True,
            include_reasoning=True,
            extract_entities=True,
        )
        # end::memory[]

        # tag::agent[]
        client = get_client()

        agent = client.as_agent(
            name="movie-memory-agent",
            instructions=(
                "You are a movie recommendation assistant with persistent "
                "memory. You remember what users have told you about their "
                "preferences, which movies you have discussed, and what "
                "you recommended in past sessions."
            ),
            context_providers=[memory.context_provider],
        )

        session = agent.create_session()
        # end::agent[]

        # tag::run[]
        queries = [
            "I really enjoy sci-fi movies, especially ones about time travel.",
            "What did I say my favorite genre was?",
            "Can you recommend something I might like?",
        ]

        for query in queries:
            print(f"\nUser: {query}")
            response = await agent.run(query, session=session)
            print(f"Assistant: {response.text}")
        # end::run[]

        # tag::search[]
        results = await memory.search_memory(
            query="sci-fi movies",
            include_messages=True,
            include_entities=True,
            include_preferences=True,
            limit=5,
        )

        print("Messages:", results.get("messages", []))
        print("Entities:", results.get("entities", []))
        print("Preferences:", results.get("preferences", []))
        # end::search[]
    finally:
        await memory_client.close()

asyncio.run(main())
