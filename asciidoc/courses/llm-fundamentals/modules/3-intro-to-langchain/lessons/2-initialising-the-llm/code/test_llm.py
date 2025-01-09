def test_llm(test_helpers, monkeypatch):

    output = test_helpers.run_module(monkeypatch, "llm")

    assert output > ""

def test_llm_prompt(test_helpers, monkeypatch):

    output = test_helpers.run_module(monkeypatch, "llm_prompt")

    assert output > ""

def test_llm_config(test_helpers, monkeypatch):

    output = test_helpers.run_module(monkeypatch, "llm_config")

    assert output > ""
