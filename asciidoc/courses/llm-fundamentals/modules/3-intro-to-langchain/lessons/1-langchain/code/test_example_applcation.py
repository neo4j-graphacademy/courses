def test_example_applcation(test_helpers, monkeypatch):

    output = test_helpers.run_module(monkeypatch, "example_applcation", ["hello", "exit"])

    # Test a response was received from the agent
    # There is a output which looks like Session ID: #####\n[response from LLM]\n
    assert len(output.split("\n")) == 2

