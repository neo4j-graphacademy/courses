import pytest
import os
from llm_chain import create_fruit_chain as create_basic_chain
from llm_chain_output_json import create_fruit_chain as create_json_chain


class TestBasicChain:
    def test_chain_creation(self):
        """Test that the basic chain can be created"""
        chain = create_basic_chain()
        assert chain is not None

    def test_chain_invocation(self):
        """Test that the basic chain returns a string response"""
        chain = create_basic_chain()
        response = chain.invoke({"fruit": "apple"})
        assert isinstance(response, str)
        assert len(response) > 0

class TestJsonChain:
    def test_chain_creation(self):
        """Test that the JSON chain can be created"""
        chain = create_json_chain()
        assert chain is not None

    def test_chain_invocation(self):
        """Test that the JSON chain returns properly formatted JSON"""
        chain = create_json_chain()
        response = chain.invoke({"fruit": "apple"})
        assert isinstance(response, dict)
        assert "description" in response
        assert isinstance(response["description"], str)
        assert len(response["description"]) > 0

    def test_different_fruits(self):
        """Test the chain with different fruits"""
        chain = create_json_chain()
        fruits = ["banana", "orange", "grape"]
        
        for fruit in fruits:
            response = chain.invoke({"fruit": fruit})
            assert isinstance(response, dict)
            assert "description" in response
            assert fruit.lower() in response["description"].lower()
