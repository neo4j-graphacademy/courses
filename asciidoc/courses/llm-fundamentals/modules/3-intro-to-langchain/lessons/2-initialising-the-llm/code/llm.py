from langchain.llms import OpenAI

llm = OpenAI(openai_api_key="sk-...")

response = llm("What is Neo4j?")

print(response)