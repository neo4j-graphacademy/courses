def test_cypher_gen(test_helpers, monkeypatch):

    import ast

    output = test_helpers.run_module(
        monkeypatch, 
        "cypher-gen"
    )
    
    # load result into a dictionary
    cypher_result = ast.literal_eval(output.split("\n")[-1])
    assert cypher_result["result"] > ""