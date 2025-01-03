def test_retreiver_chain(test_helpers, monkeypatch):

    assert test_helpers.run_module(monkeypatch, "retreiver_chain") > ""