# tag::imports[]
from mcp.server.fastmcp import FastMCP
# end::imports[]

# tag::server[]
# Create an MCP server
mcp = FastMCP("Strawberry")
# end::server[]


# tag::tool[]
@mcp.tool()
def count_letters(text: str, search: str) -> int:
    """
    Count occurrences of a letter in the text.
    
    Args:
        text: The text to search in
        search: The letter or substring to count
    
    Returns:
        Number of times the search string appears (case-insensitive)
    """
    return text.lower().count(search.lower())
# end::tool[]


# tag::run[]
if __name__ == "__main__":
    mcp.run(transport="streamable-http")
# end::run[]

