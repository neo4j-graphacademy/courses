def test_llm_chain(test_helpers, monkeypatch):

    assert test_helpers.run_module(monkeypatch, "llm_chain") > ""

def test_llm_chain_output(test_helpers, monkeypatch):

    assert test_helpers.run_module(monkeypatch, "llm_chain_output") > ""

def test_llm_chain_output_json(test_helpers, monkeypatch):

    assert test_helpers.run_module(monkeypatch, "llm_chain_output_json") > ""
