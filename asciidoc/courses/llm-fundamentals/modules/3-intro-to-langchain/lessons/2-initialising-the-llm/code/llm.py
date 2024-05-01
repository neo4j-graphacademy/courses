from langchain_openai import OpenAI

llm = OpenAI(openai_api_key="sk-...")

response = llm.invoke("What is Neo4j?")

print(response)