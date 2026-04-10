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
# Create context provider with vector search
provider = Neo4jContextProvider(
    uri=neo4j_settings.uri,
    username=neo4j_settings.username,
    password=neo4j_settings.get_password(),
    index_name=neo4j_settings.vector_index_name,
    index_type="vector",
    embedder=embedder,
    top_k=5,
    context_prompt=(
        "## Semantic Search Results\n"
        "Use the following semantically relevant movie plots from the "
        "knowledge graph to answer questions about movies:"
    ),
)
# end::provider[]

# tag::agent[]
async def main():
    async with provider:
        client = get_client()

        agent = client.as_agent(
            name="vector-agent",
            instructions=(
                "You are a helpful assistant that answers questions about "
                "movies using the provided semantic search context. "
                "Be concise and accurate. When the context contains "
                "relevant information, cite it in your response."
            ),
            context_providers=[provider],
        )

        session = agent.create_session()
        # end::agent[]

        # tag::run[]
        query = "Find me movies about time travel"
        print(f"User: {query}\n")
        print("Answer: ", end="", flush=True)
        response = await agent.run(query, session=session)
        print(response.text)
        print()
        # end::run[]

asyncio.run(main())
