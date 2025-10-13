# Add Neo4j Connection - Solution

This solution demonstrates how to add Neo4j connection management to your MCP server using lifespan management.

## What This Solution Shows

- ✅ Lifespan management with async context manager
- ✅ Environment variable configuration
- ✅ Neo4j driver initialization and cleanup
- ✅ Connection testing tool
- ✅ Proper resource management

## Setup

### 1. Install Dependencies

```bash
cd server
uv add mcp[cli] neo4j python-dotenv
```

Or with pip:

```bash
pip install "mcp[cli]" neo4j python-dotenv
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your Neo4j connection details:

```bash
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-actual-password
```

### 3. Run the Server

```bash
uv run solution.py
```

Or test with MCP Inspector:

```bash
npx @modelcontextprotocol/inspector uv run solution.py
```

## Testing the Connection

Once connected in the MCP Inspector:

1. Go to the **Tools** tab
2. Find the `test_connection` tool
3. Click **Execute**
4. You should see: "Connection successful!"

If the connection fails, check:
- Is Neo4j running?
- Are your credentials correct in `.env`?
- Can you connect with Neo4j Browser?

## Code Structure

### Lifespan Management

```python
@asynccontextmanager
async def app_lifespan(server: FastMCP) -> AsyncIterator[AppContext]:
    # Initialize driver on server startup
    driver = AsyncGraphDatabase.driver(uri, auth=(username, password))
    
    try:
        yield AppContext(driver=driver)  # Available during server lifetime
    finally:
        await driver.close()  # Cleanup on shutdown
```

### Using the Driver in Tools

```python
@mcp.tool()
async def test_connection(ctx: Context) -> str:
    # Access driver from lifespan context
    driver = ctx.request_context.lifespan_context.driver
    
    # Use driver for queries
    records, _, _ = await driver.execute_query(...)
```

## Next Steps

After completing this challenge, you'll:
- Understand lifespan management
- Know how to configure environment variables
- Be able to access shared resources in tools
- Have a working Neo4j connection for future challenges

## Troubleshooting

### "Connection refused"
- Check Neo4j is running: `http://localhost:7474`
- Verify the URI in your `.env` file

### "Authentication failed"
- Check username and password in `.env`
- Default credentials: `neo4j` / `neo4j` (you'll be prompted to change)

### "Module not found: dotenv"
- Install python-dotenv: `uv add python-dotenv`

### ".env file not loaded"
- Make sure `.env` is in the same directory as `solution.py`
- Check file has no typos: `.env` not `.env.txt`

