import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from dataclasses import dataclass

from dotenv import load_dotenv
from neo4j import AsyncGraphDatabase, AsyncDriver

from mcp.server.fastmcp import Context, FastMCP

# Load environment variables
load_dotenv()


# tag::lifespan[]
@dataclass
class AppContext:
    """Application context with Neo4j driver and database."""
    driver: AsyncDriver
    database: str


@asynccontextmanager
async def app_lifespan(server: FastMCP) -> AsyncIterator[AppContext]:
    """Manage Neo4j driver lifecycle."""
    uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    username = os.getenv("NEO4J_USERNAME", "neo4j")
    password = os.getenv("NEO4J_PASSWORD", "password")
    database = os.getenv("NEO4J_DATABASE", "neo4j")
    
    driver = AsyncGraphDatabase.driver(uri, auth=(username, password))
    
    try:
        yield AppContext(driver=driver, database=database)
    finally:
        await driver.close()
# end::lifespan[]


# tag::server[]
mcp = FastMCP("Movies GraphRAG Server", lifespan=app_lifespan)
# end::server[]


# tag::count_letters[]
@mcp.tool()
def count_letters(text: str, search: str) -> int:
    """Count occurrences of a letter in the text"""
    return text.lower().count(search.lower())
# end::count_letters[]


# tag::get_movies_by_genre[]
@mcp.tool()
async def get_movies_by_genre(genre: str, limit: int = 10, ctx: Context = None) -> list[dict]:
    """
    Get movies by genre from the Neo4j database.
    
    Args:
        genre: The genre to search for (e.g., "Action", "Drama", "Comedy")
        limit: Maximum number of movies to return (default: 10)
    """
    await ctx.info(f"Searching for {genre} movies (limit: {limit})...")
    
    context = ctx.request_context.lifespan_context
    
    await ctx.debug(f"Executing Cypher query for genre: {genre}")
    
    try:
        records, summary, keys = await context.driver.execute_query(
            """
            MATCH (m:Movie)-[:IN_GENRE]->(g:Genre {name: $genre})
            RETURN m.title AS title,
                   m.tagline AS tagline,
                   m.released AS released
            ORDER BY m.imdbRating DESC
            LIMIT $limit
            """,
            genre=genre,
            limit=limit,
            database_=context.database
        )
        
        movies = [record.data() for record in records]
        
        await ctx.info(f"Found {len(movies)} {genre} movies")
        
        if len(movies) == 0:
            await ctx.warning(f"No movies found for genre: {genre}")
        
        return movies
        
    except Exception as e:
        await ctx.error(f"Query failed: {str(e)}")
        raise
# end::get_movies_by_genre[]


# tag::get_movie_resource[]
@mcp.resource("movie://{tmdb_id}")
async def get_movie(tmdb_id: str, ctx: Context) -> str:
    """
    Get detailed information about a specific movie by TMDB ID.
    
    Args:
        tmdb_id: The TMDB ID of the movie (e.g., "603" for The Matrix)
    
    Returns:
        Formatted string with movie details including title, plot, cast, and genres
    """
    await ctx.info(f"Fetching movie details for TMDB ID: {tmdb_id}")
    
    context = ctx.request_context.lifespan_context
    
    try:
        records, _, _ = await context.driver.execute_query(
            """
            MATCH (m:Movie {tmdbId: $tmdb_id})
            RETURN m.title AS title,
               m.released AS released,
               m.tagline AS tagline,
               [ (m)-[:IN_GENRE]->(g:Genre) | g.name ] AS genres,
               [ (p)-[:ACTED_IN]->(m) | p.name ] AS actors,
               [ (d)-[:DIRECTED]->(m) | d.name ] AS directors
            """,
            tmdb_id=tmdb_id,
            database_=context.database
        )
        
        if not records:
            await ctx.warning(f"Movie with TMDB ID {tmdb_id} not found")
            return f"Movie with TMDB ID {tmdb_id} not found in database"
        
        movie = records[0].data()
        
        # Format the output
        output = []
        output.append(f"# {movie['title']} ({movie['released']})")
        output.append("")
        
        if movie['tagline']:
            output.append(f"_{movie['tagline']}_")
            output.append("")
        
        output.append(f"**Rating:** {movie['rating']}/10")
        output.append(f"**Runtime:** {movie['runtime']} minutes")
        output.append(f"**Genres:** {', '.join(movie['genres'])}")
        
        if movie['directors']:
            output.append(f"**Director(s):** {', '.join(movie['directors'])}")
        
        output.append("")
        output.append("## Plot")
        output.append(movie['plot'])
        
        if movie['cast']:
            output.append("")
            output.append("## Cast")
            for actor in movie['cast']:
                if actor['role']:
                    output.append(f"- {actor['name']} as {actor['role']}")
                else:
                    output.append(f"- {actor['name']}")
        
        result = "\n".join(output)
        
        await ctx.info(f"Successfully fetched details for '{movie['title']}'")
        
        return result
        
    except Exception as e:
        await ctx.error(f"Failed to fetch movie: {str(e)}")
        raise
# end::get_movie_resource[]


# tag::run[]
if __name__ == "__main__":
    mcp.run()
# end::run[]

