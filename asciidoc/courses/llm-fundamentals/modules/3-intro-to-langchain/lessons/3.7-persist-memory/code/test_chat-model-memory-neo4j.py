def test_chat_model_memory_neo4j(test_helpers, monkeypatch):

    output = test_helpers.run_module(
        monkeypatch, 
        "chat-model-memory-neo4j",
        ["Whats happening at Fistral?", "exit"]
    )
    
    # Test a response was received from the agent
    # There is a output which looks like Session ID: #####\n[response from LLM]\n
    assert len(output.split("\n")) == 2