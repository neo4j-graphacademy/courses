def test_create_index(test_helpers, monkeypatch):
    import os
    from langchain_neo4j import Neo4jGraph

    test_helpers.run_module(
        monkeypatch,
        "create_index"
        )

    graph = Neo4jGraph(
        url=os.getenv("NEO4J_URI"),
        username=os.getenv("NEO4J_USERNAME"),
        password=os.getenv("NEO4J_PASSWORD")
        )

    result = test_helpers.run_cypher(
        graph,
        "SHOW VECTOR INDEXES WHERE name = 'myVectorIndex'"
        )

    assert len(result) == 1
