def test_chat_agent(test_helpers, monkeypatch):

    output = test_helpers.run_module(
        monkeypatch, 
        "chat-agent",
        ["Find a movie about the meaning of life", "exit"]
    )
    
    # Test a response was received from the agent
    # There is a output which looks like Session ID: #####\n[response from LLM]\n
    assert len(output.split("\n")) == 2

def test_chat_agent_trailer(test_helpers, monkeypatch):

    output = test_helpers.run_module(
        monkeypatch, 
        "chat-agent-trailer",
        ["Find the movie trailer for the Matrix.", "exit"]
    )
    
    # Test a response was received from the agent
    # There is a output which looks like Session ID: #####\n[response from LLM]\n
    assert len(output.split("\n")) >= 2