def test_chat_model(test_helpers, monkeypatch):

    assert test_helpers.run_module(monkeypatch, "chat-model") > ""

def test_chat_model_chain(test_helpers, monkeypatch):

    assert test_helpers.run_module(monkeypatch, "chat-model-chain") > ""

def test_chat_model_context(test_helpers, monkeypatch):

    assert test_helpers.run_module(monkeypatch, "chat-model-context") > ""