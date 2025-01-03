def test_cypher_gen_control_response(test_helpers, monkeypatch):

    import ast

    output = test_helpers.run_module(
        monkeypatch, 
        "cypher-gen-control-response"
    )
    
    cypher_result = ast.literal_eval(output.split("\n")[-1])
    assert cypher_result["result"] > ""

def test_cypher_gen_follow_schema(test_helpers, monkeypatch):

    import ast

    output = test_helpers.run_module(
        monkeypatch, 
        "cypher-gen-follow-schema"
    )
    
    cypher_result = ast.literal_eval(output.split("\n")[-1])
    assert cypher_result["result"] > ""

def test_cypher_gen_understand_data(test_helpers, monkeypatch):

    import ast

    output = test_helpers.run_module(
        monkeypatch, 
        "cypher-gen-understand-data"
    )
    
    cypher_result = ast.literal_eval(output.split("\n")[-1])
    assert cypher_result["result"] > ""