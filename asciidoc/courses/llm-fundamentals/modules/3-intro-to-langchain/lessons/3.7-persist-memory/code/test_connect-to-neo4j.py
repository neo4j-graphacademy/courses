def test_connect_to_neo4j(test_helpers, monkeypatch):

    assert test_helpers.run_module(monkeypatch, "connect-to-neo4j") > ""