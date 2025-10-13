# MCP Server - Course Project

This directory contains your MCP (Model Context Protocol) server code for the **Building GraphRAG Python MCP Tools** course.

## Quick Setup

### 1. Create Environment Variables

Copy the example environment file and update it with your Neo4j credentials:

```bash
cp .env.example .env
```

Then edit `.env` with your actual Neo4j Sandbox or Aura credentials:

```bash
NEO4J_URI=bolt://your-sandbox-url.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-actual-password
```

### 2. Initialize Your Project

Initialize a new Python project with uv:

```bash
uv init
```

### 3. Install Dependencies

Install the MCP Python SDK and Neo4j driver:

```bash
uv add "mcp[cli]"
uv add neo4j
uv add python-dotenv  # For loading .env files
```

### 4. Create Your Server

Create a `main.py` file and start building your MCP server!

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("My Server")

@mcp.tool()
def my_first_tool(text: str) -> str:
    """Your first MCP tool!"""
    return f"You said: {text}"

if __name__ == "__main__":
    mcp.run()
```

### 5. Run Your Server

```bash
uv run main.py
```

## Getting Neo4j Credentials

You need a Neo4j database with the **Recommendations** dataset for this course.

### Option 1: Neo4j Sandbox (Recommended)

1. Go to [sandbox.neo4j.com](https://sandbox.neo4j.com)
2. Sign in (create free account if needed)
3. Click **New Project**
4. Select **Recommendations** dataset
5. Click **Launch** and wait ~60 seconds
6. Copy connection details to your `.env` file

### Option 2: Neo4j Aura Free

1. Go to [neo4j.com/cloud/aura-free](https://neo4j.com/cloud/aura-free/)
2. Create a free instance
3. Load the Recommendations dataset
4. Copy connection details to your `.env` file

## Testing Your Connection

Use Neo4j Browser to verify your connection:

1. Open Neo4j Browser (link provided in Sandbox/Aura dashboard)
2. Run this query:

```cypher
MATCH (m:Movie) RETURN m.title LIMIT 5
```

You should see 5 movie titles!

## Project Structure

```
server/
├── .env              # Your credentials (DO NOT COMMIT)
├── .env.example      # Template for credentials
├── main.py           # Your MCP server code
├── pyproject.toml    # Python project configuration
└── README.md         # This file
```

## Need Help?

- 📚 [MCP Python SDK Documentation](https://github.com/modelcontextprotocol/python-sdk)
- 📚 [Neo4j Python Driver Documentation](https://neo4j.com/docs/python-manual/current/)
- 📚 [FastMCP Documentation](https://github.com/jlowin/fastmcp)
- 🎓 [GraphAcademy Courses](https://graphacademy.neo4j.com)

## Security Note

⚠️ **Important**: Never commit your `.env` file to version control!

The `.env` file is already in `.gitignore`, but always double-check before committing.

