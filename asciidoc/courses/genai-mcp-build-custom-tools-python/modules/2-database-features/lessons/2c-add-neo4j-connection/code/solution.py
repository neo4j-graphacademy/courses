# tag::imports[]
import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from dataclasses import dataclass

from dotenv import load_dotenv
from neo4j import AsyncGraphDatabase, AsyncDriver

from mcp.server.fastmcp import Context, FastMCP

# Load environment variables from .env file
load_dotenv()
# end::imports[]


# tag::context[]
@dataclass
class AppContext:
    """Application context with Neo4j driver."""
    driver: AsyncDriver
# end::context[]


# tag::lifespan[]
@asynccontextmanager
async def app_lifespan(server: FastMCP) -> AsyncIterator[AppContext]:
    """Manage Neo4j driver lifecycle."""
    
    # Read connection details from environment
    uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    username = os.getenv("NEO4J_USERNAME", "neo4j")
    password = os.getenv("NEO4J_PASSWORD", "password")
    
    # Initialize driver on startup
    driver = AsyncGraphDatabase.driver(uri, auth=(username, password))
    
    try:
        # Yield context with driver
        yield AppContext(driver=driver)
    finally:
        # Close driver on shutdown
        await driver.close()
# end::lifespan[]


# tag::server[]
# Create server with lifespan
mcp = FastMCP("Movie Server", lifespan=app_lifespan)
# end::server[]


# tag::count_letters[]
@mcp.tool()
def count_letters(text: str, search: str) -> int:
    """Count occurrences of a letter in the text"""
    return text.lower().count(search.lower())
# end::count_letters[]


# tag::test_connection[]
@mcp.tool()
async def test_connection(ctx: Context) -> str:
    """Test the Neo4j connection."""
    
    # Access driver from lifespan context
    driver = ctx.request_context.lifespan_context.driver
    
    # Execute a simple query
    records, summary, keys = await driver.execute_query(
        "RETURN 'Connection successful!' AS message"
    )
    
    return records[0]["message"]
# end::test_connection[]


# tag::run[]
if __name__ == "__main__":
    mcp.run()
# end::run[]

