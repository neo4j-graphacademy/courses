import asyncio

from dotenv import load_dotenv
load_dotenv(override=True)

from llm_provider import get_client, get_embedder
from agent_framework_neo4j import Neo4jContextProvider, Neo4jSettings

# Load settings from environment variables
neo4j_settings = Neo4jSettings()

# Create embedder
embedder = get_embedder()

# tag::retrieval_query[]
# Graph-enriched retrieval query
# Appended after vector search: YIELD node, score
RETRIEVAL_QUERY = """
MATCH (node)-[:IN_GENRE]->(g:Genre)
WITH node, score, collect(DISTINCT g.name) AS genres
OPTIONAL MATCH (p:Person)-[:ACTED_IN]->(node)
WITH node, score, genres, collect(DISTINCT p.name)[0..5] AS actors
OPTIONAL MATCH (d:Person)-[:DIRECTED]->(node)
WITH node, score, genres, actors, collect(DISTINCT d.name) AS directors
WHERE score IS NOT NULL
RETURN
    node.plot AS text,
    score,
    node.title AS title,
    node.released AS released,
    genres,
    actors,
    directors
ORDER BY score DESC
"""
# end::retrieval_query[]

# tag::provider[]
# Create context provider with graph-enriched retrieval
provider = Neo4jContextProvider(
    uri=neo4j_settings.uri,
    username=neo4j_settings.username,
    password=neo4j_settings.get_password(),
    index_name=neo4j_settings.vector_index_name,
    index_type="vector",
    retrieval_query=RETRIEVAL_QUERY,
    embedder=embedder,
    top_k=5,
    context_prompt=(
        "## Graph-Enriched Movie Context\n"
        "The following information combines semantic search results with "
        "graph traversal to provide movie, actor, genre, and director context:"
    ),
)
# end::provider[]

# tag::agent[]
async def main():
    async with provider:
        client = get_client()

        agent = client.as_agent(
            name="graph-enriched-agent",
            instructions=(
                "You are a helpful assistant that answers questions about "
                "movies using graph-enriched context. Your context includes:\n"
                "- Semantic search matches from movie plots\n"
                "- Movie titles and release years\n"
                "- Genres the movie belongs to\n"
                "- Actors who appeared in the movie\n"
                "- Directors of the movie\n\n"
                "When answering, cite the movie title, relevant actors, and genres. "
                "Be specific and reference the enriched graph data."
            ),
            context_providers=[provider],
        )

        session = agent.create_session()
        # end::agent[]

        # tag::run[]
        query = "What are some good science fiction movies and who stars in them?"
        print(f"User: {query}\n")
        print("Answer: ", end="", flush=True)
        response = await agent.run(query, session=session)
        print(response.text)
        print()
        # end::run[]

asyncio.run(main())
