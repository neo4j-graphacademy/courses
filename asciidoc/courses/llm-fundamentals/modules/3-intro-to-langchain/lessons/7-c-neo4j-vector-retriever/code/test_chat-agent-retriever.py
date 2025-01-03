def test_chat_agent_trailer(test_helpers, monkeypatch):

    output = test_helpers.run_module(
        monkeypatch, 
        "chat-agent-retriever",
        [
            "Find a movie with a plot about a mission to the moon that goes wrong",
            "exit"
        ]
    )
    
    assert len(output.split("\n")) >= 2