import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from dataclasses import dataclass

from dotenv import load_dotenv
from neo4j import AsyncGraphDatabase, AsyncDriver

from mcp.server.fastmcp import Context, FastMCP

load_dotenv()


# tag::lifespan[]
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
# end::lifespan[]


# tag::server[]
mcp = FastMCP("Movie GraphRAG Server", lifespan=app_lifespan)
# end::server[]


# tag::get_schema[]
@mcp.tool()
async def get_neo4j_schema(ctx: Context) -> dict:
    """
    Get the Neo4j database schema including node labels, relationship types, and properties.
    
    This tool is essential for understanding the graph structure before writing queries.
    
    Returns:
        Dictionary containing node labels, relationship types, and their properties
    """
    await ctx.info("Fetching Neo4j schema...")
    
    driver = ctx.request_context.lifespan_context.driver
    
    try:
        # Get node labels and their properties
        node_labels_query = """
        CALL db.labels() YIELD label
        CALL apoc.meta.nodeTypeProperties()
        YIELD nodeType, propertyName, propertyTypes
        WHERE nodeType = ':`' + label + '`'
        RETURN label, 
               collect({property: propertyName, types: propertyTypes}) as properties
        ORDER BY label
        """
        
        # Fallback query if APOC is not available
        simple_labels_query = """
        CALL db.labels() YIELD label
        RETURN label, [] as properties
        ORDER BY label
        """
        
        try:
            labels_records, _, _ = await driver.execute_query(node_labels_query)
        except:
            await ctx.debug("APOC not available, using simple schema query")
            labels_records, _, _ = await driver.execute_query(simple_labels_query)
        
        node_labels = [r.data() for r in labels_records]
        
        # Get relationship types
        rel_types_query = """
        CALL db.relationshipTypes() YIELD relationshipType
        RETURN relationshipType
        ORDER BY relationshipType
        """
        
        rel_records, _, _ = await driver.execute_query(rel_types_query)
        relationship_types = [r["relationshipType"] for r in rel_records]
        
        # Get relationship patterns
        patterns_query = """
        MATCH (a)-[r]->(b)
        WITH labels(a)[0] as source, type(r) as rel, labels(b)[0] as target
        RETURN DISTINCT source + ' -[' + rel + ']-> ' + target as pattern
        ORDER BY pattern
        LIMIT 50
        """
        
        pattern_records, _, _ = await driver.execute_query(patterns_query)
        patterns = [r["pattern"] for r in pattern_records]
        
        schema = {
            "node_labels": node_labels,
            "relationship_types": relationship_types,
            "common_patterns": patterns
        }
        
        await ctx.info(f"Schema retrieved: {len(node_labels)} node types, {len(relationship_types)} relationship types")
        
        return schema
        
    except Exception as e:
        await ctx.error(f"Failed to fetch schema: {str(e)}")
        raise
# end::get_schema[]


# tag::query_neo4j[]
@mcp.tool()
async def query_neo4j(cypher: str, parameters: dict = None, ctx: Context = None) -> dict:
    """
    Execute a read-only Cypher query against the Neo4j database.
    
    Use this tool to test Cypher queries before incorporating them into tools.
    
    Args:
        cypher: The Cypher query to execute (must be read-only)
        parameters: Optional dictionary of parameters for the query
        
    Returns:
        Dictionary with 'results' (list of records) and 'summary' (query metadata)
    """
    await ctx.info(f"Executing Cypher query...")
    await ctx.debug(f"Query: {cypher}")
    
    driver = ctx.request_context.lifespan_context.driver
    
    # Validate query is read-only (basic check)
    cypher_upper = cypher.strip().upper()
    write_keywords = ['CREATE', 'DELETE', 'SET', 'REMOVE', 'MERGE']
    
    for keyword in write_keywords:
        if keyword in cypher_upper:
            await ctx.error(f"Query contains write operation: {keyword}")
            return {
                "error": f"Write operations are not allowed. Query contains: {keyword}",
                "results": [],
                "summary": {}
            }
    
    try:
        if parameters is None:
            parameters = {}
        
        records, summary, keys = await driver.execute_query(
            cypher,
            parameters_=parameters
        )
        
        results = [record.data() for record in records]
        
        summary_data = {
            "result_available_after": summary.result_available_after,
            "result_consumed_after": summary.result_consumed_after,
            "query_type": summary.query_type
        }
        
        await ctx.info(f"Query executed successfully: {len(results)} results")
        
        return {
            "results": results,
            "summary": summary_data,
            "count": len(results)
        }
        
    except Exception as e:
        error_msg = str(e)
        await ctx.error(f"Query failed: {error_msg}")
        
        return {
            "error": error_msg,
            "results": [],
            "summary": {}
        }
# end::query_neo4j[]


# tag::text_to_cypher[]
@mcp.tool()
async def text_to_cypher(question: str, ctx: Context) -> dict:
    """
    Convert a natural language question into a Cypher query and execute it.
    
    This tool combines schema understanding with query generation to answer
    questions about the movie database in natural language.
    
    Args:
        question: Natural language question about movies (e.g., "What action movies were released in 1999?")
        
    Returns:
        Dictionary with generated Cypher query, results, and explanation
    """
    await ctx.info(f"Converting question to Cypher: {question}")
    
    driver = ctx.request_context.lifespan_context.driver
    
    try:
        # Step 1: Get the schema to understand the database structure
        await ctx.debug("Step 1: Retrieving database schema")
        schema = await get_neo4j_schema(ctx)
        
        # Step 2: Analyze the question to identify key entities and intents
        await ctx.debug("Step 2: Analyzing question")
        
        question_lower = question.lower()
        
        # Identify search patterns
        patterns = []
        
        # Check for genre queries
        if any(word in question_lower for word in ['genre', 'action', 'comedy', 'drama', 'sci-fi', 'science fiction']):
            patterns.append('genre')
        
        # Check for year/decade queries
        if any(word in question_lower for word in ['year', 'released', '199', '200', '198', 'decade']):
            patterns.append('year')
        
        # Check for actor queries
        if any(word in question_lower for word in ['actor', 'actress', 'starred', 'acted', 'keanu', 'tom']):
            patterns.append('actor')
        
        # Check for director queries
        if any(word in question_lower for word in ['director', 'directed', 'filmmaker']):
            patterns.append('director')
        
        # Check for rating queries
        if any(word in question_lower for word in ['rating', 'rated', 'best', 'top', 'highest']):
            patterns.append('rating')
        
        await ctx.debug(f"Identified patterns: {patterns}")
        
        # Step 3: Generate appropriate Cypher query
        await ctx.debug("Step 3: Generating Cypher query")
        
        cypher_query = None
        parameters = {}
        
        # Genre + Year query
        if 'genre' in patterns and 'year' in patterns:
            # Extract year
            import re
            years = re.findall(r'\b(19\d{2}|20\d{2})\b', question)
            
            # Extract genre
            genre_map = {
                'action': 'Action',
                'comedy': 'Comedy', 
                'drama': 'Drama',
                'sci-fi': 'Science Fiction',
                'science fiction': 'Science Fiction',
                'thriller': 'Thriller',
                'horror': 'Horror'
            }
            
            genre = None
            for key, value in genre_map.items():
                if key in question_lower:
                    genre = value
                    break
            
            if years and genre:
                year = int(years[0])
                cypher_query = """
                MATCH (m:Movie)-[:IN_GENRE]->(g:Genre {name: $genre})
                WHERE m.released = $year
                RETURN m.title AS title, 
                       m.released AS released,
                       m.tagline AS tagline,
                       m.imdbRating AS rating
                ORDER BY m.imdbRating DESC
                LIMIT 10
                """
                parameters = {"genre": genre, "year": year}
        
        # Actor query
        elif 'actor' in patterns:
            # Extract actor name (simplified)
            words = question.split()
            # Look for capitalized words that might be names
            potential_names = [w for w in words if w[0].isupper() and w.lower() not in ['what', 'who', 'which', 'movies', 'films']]
            
            if potential_names:
                actor_name = ' '.join(potential_names[:2])  # Take first two capitalized words
                cypher_query = """
                MATCH (p:Person {name: $actor_name})-[:ACTED_IN]->(m:Movie)
                RETURN m.title AS title,
                       m.released AS released,
                       m.imdbRating AS rating
                ORDER BY m.released DESC
                LIMIT 10
                """
                parameters = {"actor_name": actor_name}
        
        # Generic genre query
        elif 'genre' in patterns:
            genre_map = {
                'action': 'Action',
                'comedy': 'Comedy',
                'drama': 'Drama',
                'sci-fi': 'Science Fiction',
                'science fiction': 'Science Fiction'
            }
            
            genre = None
            for key, value in genre_map.items():
                if key in question_lower:
                    genre = value
                    break
            
            if genre:
                cypher_query = """
                MATCH (m:Movie)-[:IN_GENRE]->(g:Genre {name: $genre})
                RETURN m.title AS title,
                       m.released AS released,
                       m.imdbRating AS rating
                ORDER BY m.imdbRating DESC
                LIMIT 10
                """
                parameters = {"genre": genre}
        
        # Top rated movies
        elif 'rating' in patterns or 'best' in question_lower or 'top' in question_lower:
            cypher_query = """
            MATCH (m:Movie)
            WHERE m.imdbRating IS NOT NULL
            RETURN m.title AS title,
                   m.released AS released,
                   m.imdbRating AS rating
            ORDER BY m.imdbRating DESC
            LIMIT 10
            """
        
        # Default: recent movies
        if cypher_query is None:
            await ctx.warning("Could not determine specific query pattern, showing recent movies")
            cypher_query = """
            MATCH (m:Movie)
            RETURN m.title AS title,
                   m.released AS released,
                   m.imdbRating AS rating
            ORDER BY m.released DESC
            LIMIT 10
            """
        
        await ctx.info(f"Generated Cypher query with {len(parameters)} parameters")
        
        # Step 4: Execute the query
        await ctx.debug("Step 4: Executing generated query")
        
        records, summary, keys = await driver.execute_query(
            cypher_query,
            parameters_=parameters
        )
        
        results = [record.data() for record in records]
        
        await ctx.info(f"Query executed successfully: {len(results)} results")
        
        # Step 5: Format response
        return {
            "question": question,
            "cypher": cypher_query,
            "parameters": parameters,
            "results": results,
            "count": len(results),
            "explanation": f"Identified patterns: {patterns}. Generated query to match your question."
        }
        
    except Exception as e:
        await ctx.error(f"Text-to-Cypher conversion failed: {str(e)}")
        return {
            "question": question,
            "error": str(e),
            "results": [],
            "explanation": "Failed to convert question to Cypher query"
        }
# end::text_to_cypher[]


# tag::previous_tools[]
# Previous tools from earlier challenges

@mcp.tool()
def count_letters(text: str, search: str) -> int:
    """Count occurrences of a letter in the text"""
    return text.lower().count(search.lower())


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
        
        return [record.data() for record in records]
    except Exception as e:
        await ctx.error(f"Query failed: {str(e)}")
        raise


@mcp.resource("movie://{tmdb_id}")
async def get_movie(tmdb_id: str, ctx: Context) -> str:
    """Get detailed information about a specific movie by TMDB ID."""
    driver = ctx.request_context.lifespan_context.driver
    
    records, _, _ = await driver.execute_query(
        """
        MATCH (m:Movie {tmdbId: $tmdb_id})
        OPTIONAL MATCH (m)-[:IN_GENRE]->(g:Genre)
        OPTIONAL MATCH (p:Person)-[r:ACTED_IN]->(m)
        RETURN m.title AS title,
               m.released AS released,
               m.plot AS plot,
               collect(DISTINCT g.name) AS genres,
               collect(DISTINCT p.name)[..5] AS actors
        """,
        tmdb_id=tmdb_id
    )
    
    if not records:
        return f"Movie {tmdb_id} not found"
    
    movie = records[0].data()
    return f"{movie['title']} ({movie['released']})\nGenres: {', '.join(movie['genres'])}"


@mcp.tool()
async def browse_movies_by_genre(
    genre: str,
    cursor: str = "0",
    page_size: int = 10,
    ctx: Context = None
) -> dict:
    """Browse movies in a genre with pagination support."""
    skip = int(cursor)
    driver = ctx.request_context.lifespan_context.driver
    
    records, _, _ = await driver.execute_query(
        """
        MATCH (m:Movie)-[:IN_GENRE]->(g:Genre {name: $genre})
        RETURN m.title AS title,
               m.released AS released
        ORDER BY m.imdbRating DESC
        SKIP $skip
        LIMIT $limit
        """,
        genre=genre,
        skip=skip,
        limit=page_size
    )
    
    movies = [record.data() for record in records]
    next_cursor = str(skip + page_size) if len(movies) == page_size else None
    
    return {
        "movies": movies,
        "next_cursor": next_cursor,
        "has_more": next_cursor is not None
    }
# end::previous_tools[]


# tag::run[]
if __name__ == "__main__":
    mcp.run()
# end::run[]

