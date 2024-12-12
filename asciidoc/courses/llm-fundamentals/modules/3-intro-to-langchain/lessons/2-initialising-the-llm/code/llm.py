# Unused
from langchain_openai import OpenAI

import os 

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
llm = OpenAI(openai_api_key=OPENAI_API_KEY)

response = llm.invoke("What is Neo4j?")

print(response)