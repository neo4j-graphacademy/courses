import asyncio
import os

from dotenv import load_dotenv
load_dotenv(override=True)

from pydantic import SecretStr

from llm_provider import get_client, get_provider

from neo4j_agent_memory import MemoryClient, MemorySettings
from neo4j_agent_memory.integrations.microsoft_agent import (
    Neo4jMicrosoftMemory,
    create_memory_tools,
)

# tag::settings[]
# Configure memory settings
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

# tag::tools[]
async def main():
    memory_client = MemoryClient(settings)
    await memory_client.connect()

    try:
        # Create unified memory interface
        memory = Neo4jMicrosoftMemory.from_memory_client(
            memory_client=memory_client,
            session_id="movie-tools-session",
            include_short_term=True,
            include_long_term=True,
            extract_entities=True,
        )

        # Create callable memory tools
        tools = create_memory_tools(memory)

        for tool in tools:
            print(f"  - {tool.name}: {tool.description[:60]}...")
        # end::tools[]

        # tag::agent[]
        client = get_client()

        agent = client.as_agent(
            name="movie-assistant",
            instructions=(
                "You are a movie recommendation assistant with persistent memory.\n\n"
                "IMPORTANT: You MUST call the remember_preference tool every time "
                "a user states a preference, favorite, or interest. Do NOT just "
                "acknowledge it verbally — you must actually invoke the tool to "
                "persist it. For example, if a user says they love sci-fi, call "
                "remember_preference with category='genre' and preference='loves sci-fi'.\n\n"
                "When making recommendations, use recall_preferences to check "
                "what the user likes before suggesting something.\n\n"
                "You have access to a knowledge graph of movies and "
                "your memory of past conversations."
            ),
            tools=tools,
            context_providers=[memory.context_provider],
        )

        session = agent.create_session()
        # end::agent[]

        # tag::run[]
        queries = [
            "I love Christopher Nolan movies and anything about space.",
            "What are my movie preferences?",
            "Based on what you know about me, what should I watch next?",
        ]

        for query in queries:
            print(f"\nUser: {query}")
            async for update in agent.run(query, stream=True, session=session):
                if update.text:
                    print(update.text, end="", flush=True)
            print()
        # end::run[]

        # tag::verify[]
        results = await memory.search_memory(
            query="Christopher Nolan movies space",
            include_messages=True,
            include_entities=True,
            include_preferences=True,
            limit=5,
        )

        print("=== Stored Memories ===\n")

        if results.get("preferences"):
            print("Preferences:")
            for pref in results["preferences"]:
                print(f"  [{pref['category']}] {pref['preference']}")
            print()

        if results.get("entities"):
            print("Entities:")
            for entity in results["entities"][:5]:
                print(f"  {entity['name']} ({entity['type']})")
            print()

        if results.get("messages"):
            print(f"Messages stored: {len(results['messages'])}")
        # end::verify[]
    finally:
        await memory_client.close()

asyncio.run(main())
