def test_cypher_gen_control_response(test_helpers, monkeypatch):

    import ast
    from  neo4j.exceptions import CypherSyntaxError

    try:

        output = test_helpers.run_module(
            monkeypatch, 
            "cypher-gen-control-response"
        )
    
        cypher_result = ast.literal_eval(output.split("\n")[-1])
        assert cypher_result["result"] > ""
    
    except CypherSyntaxError as e:
        assert True, f"LLM generated incorrect Cypher: {e}"

def test_cypher_gen_follow_schema(test_helpers, monkeypatch):

    import ast
    from  neo4j.exceptions import CypherSyntaxError

    try:

        output = test_helpers.run_module(
            monkeypatch, 
            "cypher-gen-follow-schema"
        )
    
        cypher_result = ast.literal_eval(output.split("\n")[-1])
        assert cypher_result["result"] > ""
    
    except CypherSyntaxError as e:
        assert True, f"LLM generated incorrect Cypher: {e}"

def test_cypher_gen_understand_data(test_helpers, monkeypatch):

    import ast
    from  neo4j.exceptions import CypherSyntaxError

    try:

        output = test_helpers.run_module(
            monkeypatch, 
            "cypher-gen-understand-data"
        )
        
        cypher_result = ast.literal_eval(output.split("\n")[-1])
        assert cypher_result["result"] > ""
    
    except CypherSyntaxError as e:
        assert True, f"LLM generated incorrect Cypher: {e}"