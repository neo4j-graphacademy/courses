import asyncio

from dotenv import load_dotenv
load_dotenv(override=True)

from llm_provider import get_client
from agent_framework_neo4j import Neo4jContextProvider, Neo4jSettings

# tag::settings[]
# Load Neo4j settings from environment variables
neo4j_settings = Neo4jSettings()
# end::settings[]

# tag::provider[]
# Create context provider with fulltext search
provider = Neo4jContextProvider(
    uri=neo4j_settings.uri,
    username=neo4j_settings.username,
    password=neo4j_settings.get_password(),
    index_name=neo4j_settings.fulltext_index_name,
    index_type="fulltext",
    top_k=5,
    context_prompt=(
        "## Knowledge Graph Context\n"
        "Use the following information from the knowledge graph "
        "to answer questions about movies, actors, and genres:"
    ),
)
# end::provider[]

# tag::agent[]
async def main():
    async with provider:
        client = get_client()

        agent = client.as_agent(
            name="fulltext-agent",
            instructions=(
                "You are a helpful assistant that answers questions about "
                "movies using the provided knowledge graph context. "
                "Be concise and cite specific information from the context "
                "when available."
            ),
            context_providers=[provider],
        )

        session = agent.create_session()
        # end::agent[]

        # tag::run[]
        query = "Batman Gotham"
        print(f"User: {query}\n")
        print("Answer: ", end="", flush=True)
        response = await agent.run(query, session=session)
        print(response.text)
        print()
        # end::run[]

asyncio.run(main())
