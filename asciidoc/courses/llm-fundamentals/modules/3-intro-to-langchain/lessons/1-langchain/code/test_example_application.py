import pytest
from example_application import create_cypher_agent
import os

@pytest.fixture(autouse=True)
def setup():
    # Verify required environment variables are set
    required_vars = ["OPENAI_API_KEY", "NEO4J_PASSWORD"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        pytest.skip(f"Missing required environment variables: {', '.join(missing_vars)}")

def test_cypher_agent_creation():
    agent = create_cypher_agent("test-session")
    assert agent is not None

def test_cypher_agent_basic_query():
    agent = create_cypher_agent("test-session")
    response = agent.invoke(
        {"input": "How do I create a simple node in Neo4j?"},
        {"configurable": {"session_id": "test-session"}},
    )
    assert response is not None
    assert "output" in response
    assert isinstance(response["output"], str)