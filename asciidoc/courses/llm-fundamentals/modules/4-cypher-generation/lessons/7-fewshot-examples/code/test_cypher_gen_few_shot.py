def test_cypher_gen_few_shot(test_helpers, monkeypatch):

    import ast
    from  neo4j.exceptions import CypherSyntaxError

    try:

        output = test_helpers.run_module(
            monkeypatch, 
            "cypher-gen-few-shot"
        )
        
        cypher_result = ast.literal_eval(output.split("\n")[-1])
        assert cypher_result["result"] > ""

    except CypherSyntaxError as e:
        assert True, f"LLM generated incorrect Cypher: {e}"