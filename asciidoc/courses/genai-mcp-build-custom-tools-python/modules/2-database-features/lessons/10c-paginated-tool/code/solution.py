import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from dataclasses import dataclass

from dotenv import load_dotenv
from neo4j import AsyncGraphDatabase, AsyncDriver

from mcp.server.fastmcp import Context, FastMCP

load_dotenv()


@dataclass
class AppContext:
    """Application context with Neo4j driver."""
    driver: AsyncDriver


@asynccontextmanager
async def app_lifespan(server: FastMCP) -> AsyncIterator[AppContext]:
    """Manage Neo4j driver lifecycle."""
    uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    username = os.getenv("NEO4J_USERNAME", "neo4j")
    password = os.getenv("NEO4J_PASSWORD", "password")
    
    driver = AsyncGraphDatabase.driver(uri, auth=(username, password))
    
    try:
        yield AppContext(driver=driver)
    finally:
        await driver.close()


mcp = FastMCP("Movie Server", lifespan=app_lifespan)


# Previous tools from earlier challenges
@mcp.tool()
def count_letters(text: str, search: str) -> int:
    """Count occurrences of a letter in the text"""
    return text.lower().count(search.lower())


@mcp.tool()
async def test_connection(ctx: Context) -> str:
    """Test the Neo4j connection."""
    driver = ctx.request_context.lifespan_context.driver
    records, _, _ = await driver.execute_query(
        "RETURN 'Connection successful!' AS message"
    )
    return records[0]["message"]


@mcp.tool()
async def get_movies_by_genre(genre: str, limit: int = 10, ctx: Context = None) -> list[dict]:
    """Get movies by genre from the Neo4j database."""
    await ctx.info(f"Searching for {genre} movies (limit: {limit})...")
    
    driver = ctx.request_context.lifespan_context.driver
    
    try:
        records, _, _ = await driver.execute_query(
            """
            MATCH (m:Movie)-[:IN_GENRE]->(g:Genre {name: $genre})
            RETURN m.title AS title,
                   m.tagline AS tagline,
                   m.released AS released
            ORDER BY m.imdbRating DESC
            LIMIT $limit
            """,
            genre=genre,
            limit=limit
        )
        
        movies = [record.data() for record in records]
        await ctx.info(f"Found {len(movies)} {genre} movies")
        
        return movies
    except Exception as e:
        await ctx.error(f"Query failed: {str(e)}")
        raise


@mcp.resource("movie://{tmdb_id}")
async def get_movie(tmdb_id: str, ctx: Context) -> str:
    """Get detailed information about a specific movie by TMDB ID."""
    await ctx.info(f"Fetching movie details for TMDB ID: {tmdb_id}")
    
    driver = ctx.request_context.lifespan_context.driver
    
    try:
        records, _, _ = await driver.execute_query(
            """
            MATCH (m:Movie {tmdbId: $tmdb_id})
            OPTIONAL MATCH (m)-[:IN_GENRE]->(g:Genre)
            OPTIONAL MATCH (p:Person)-[r:ACTED_IN]->(m)
            OPTIONAL MATCH (d:Person)-[:DIRECTED]->(m)
            RETURN m.title AS title,
                   m.released AS released,
                   m.tagline AS tagline,
                   m.plot AS plot,
                   m.imdbRating AS rating,
                   m.runtime AS runtime,
                   collect(DISTINCT g.name) AS genres,
                   collect(DISTINCT {name: p.name, role: r.role})[..5] AS cast,
                   collect(DISTINCT d.name) AS directors
            """,
            tmdb_id=tmdb_id
        )
        
        if not records:
            return f"Movie with TMDB ID {tmdb_id} not found in database"
        
        movie = records[0].data()
        
        output = []
        output.append(f"# {movie['title']} ({movie['released']})")
        output.append("")
        if movie['tagline']:
            output.append(f"_{movie['tagline']}_")
            output.append("")
        output.append(f"**Rating:** {movie['rating']}/10")
        output.append(f"**Genres:** {', '.join(movie['genres'])}")
        
        return "\n".join(output)
    except Exception as e:
        await ctx.error(f"Failed to fetch movie: {str(e)}")
        raise


# tag::browse_movies_by_genre[]
@mcp.tool()
async def browse_movies_by_genre(
    genre: str,
    cursor: str = "0",
    page_size: int = 10,
    ctx: Context = None
) -> dict:
    """
    Browse movies in a genre with pagination support.
    
    Args:
        genre: Genre name (e.g., "Action", "Comedy", "Drama")
        cursor: Pagination cursor - position in the result set (default "0")
        page_size: Number of movies to return per page (default 10)
    
    Returns:
        Dictionary containing:
        - movies: List of movie objects with title, released, and rating
        - next_cursor: Cursor for the next page (null if no more pages)
        - page: Current page number (1-indexed)
        - has_more: Boolean indicating if more pages are available
    """
    
    # Parse cursor to get skip value
    try:
        skip = int(cursor)
    except ValueError:
        await ctx.error(f"Invalid cursor: {cursor}")
        skip = 0
    
    # Access driver from lifespan context
    driver = ctx.request_context.lifespan_context.driver
    
    # Log the request
    page_num = (skip // page_size) + 1
    await ctx.info(f"Fetching {genre} movies, page {page_num} (showing {page_size} per page)...")
    
    try:
        # Execute paginated query
        records, summary, keys = await driver.execute_query(
            """
            MATCH (m:Movie)-[:IN_GENRE]->(g:Genre {name: $genre})
            RETURN m.title AS title,
                   m.released AS released,
                   m.imdbRating AS rating
            ORDER BY m.imdbRating DESC, m.title ASC
            SKIP $skip
            LIMIT $limit
            """,
            genre=genre,
            skip=skip,
            limit=page_size
        )
        
        # Convert to list of dictionaries
        movies = [record.data() for record in records]
        
        # Calculate next cursor
        # If we got a full page, there might be more
        next_cursor = None
        if len(movies) == page_size:
            next_cursor = str(skip + page_size)
        
        # Log results
        await ctx.info(f"Returned {len(movies)} movies from page {page_num}")
        if next_cursor is None:
            await ctx.info("This is the last page")
        
        # Return structured response
        return {
            "genre": genre,
            "movies": movies,
            "next_cursor": next_cursor,
            "page": page_num,
            "page_size": page_size,
            "has_more": next_cursor is not None,
            "count": len(movies)
        }
        
    except Exception as e:
        await ctx.error(f"Query failed: {str(e)}")
        raise
# end::browse_movies_by_genre[]


if __name__ == "__main__":
    mcp.run()

