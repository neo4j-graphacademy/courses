# Neo4j Documentation MCP Server

MCP server for browsing and reading Neo4j documentation with caching.

## Usage

### Run the server

```bash
npm run mcp:docs
```

### Test with MCP Inspector

```bash
npm run mcp:docs:inspect
```

## Available Tools

- `list_manual_pages(manual_name)` - List pages from a manual (e.g., 'cypher-manual')
- `read_page(url)` - Read content from a documentation page
- `get_cache_stats()` - View cache statistics
- `clear_cache()` - Clear cached data
