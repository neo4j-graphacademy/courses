def test_chat_model_memory(test_helpers, monkeypatch):

    assert test_helpers.run_module(
        monkeypatch, 
        "chat-model-memory",
        ["Whats happening at Fistral?", "exit"]
    ) > ""