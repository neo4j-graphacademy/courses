import asyncio

from dotenv import load_dotenv
load_dotenv(override=True)

from llm_provider import get_client, get_embedder
from agent_framework_neo4j import Neo4jContextProvider, Neo4jSettings

# tag::settings[]
# Load settings from environment variables
neo4j_settings = Neo4jSettings()
# end::settings[]

# tag::embedder[]
# Create embedder for converting queries to vectors
embedder = get_embedder()
# end::embedder[]

# tag::provider[]
# Create context provider with hybrid search
provider = Neo4jContextProvider(
    uri=neo4j_settings.uri,
    username=neo4j_settings.username,
    password=neo4j_settings.get_password(),
    index_name=neo4j_settings.vector_index_name,
    index_type="hybrid",
    fulltext_index_name=neo4j_settings.fulltext_index_name,
    embedder=embedder,
    top_k=5,
    context_prompt=(
        "## Movie Knowledge Graph Context\n"
        "Use the following movie information from the knowledge graph "
        "to answer questions:"
    ),
)
# end::provider[]

# tag::agent[]
async def main():
    async with provider:
        client = get_client()

        agent = client.as_agent(
            name="movie-hybrid-agent",
            instructions=(
                "You are a movie recommendation assistant. Answer questions "
                "using the movie data provided in your context."
            ),
            context_providers=[provider],
        )

        session = agent.create_session()
        # end::agent[]

        # tag::run[]
        query = "Find movies about dream-sharing technology"
        print(f"User: {query}\n")
        print("Answer: ", end="", flush=True)
        response = await agent.run(query, session=session)
        print(response.text)
        print()
        # end::run[]

asyncio.run(main())
