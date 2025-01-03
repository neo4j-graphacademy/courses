def test_query_vector(test_helpers, monkeypatch): 
    import os
    import pathlib
    from langchain_neo4j import Neo4jGraph

    graph = Neo4jGraph(
        url=os.getenv("NEO4J_URI"),
        username=os.getenv("NEO4J_USERNAME"),
        password=os.getenv("NEO4J_PASSWORD")
    )

    test_helpers.run_cypher_file(
        graph,
        os.path.join(pathlib.Path(__file__).parent.resolve(), "..", "reset.cypher")
    )

    assert test_helpers.run_module(
        monkeypatch,
        "query_vector"
    ) > ""