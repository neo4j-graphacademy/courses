import os
from langchain_openai import ChatOpenAI
from langchain_neo4j import GraphCypherQAChain, Neo4jGraph
from langchain.prompts import PromptTemplate

# tag::openai-neo4j[]
llm = ChatOpenAI(
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

graph = Neo4jGraph(
    url=os.getenv("NEO4J_URI"),
    username=os.getenv("NEO4J_USERNAME"),
    password=os.getenv("NEO4J_PASSWORD")
)
# end::openai-neo4j[]

# tag::template[]
CYPHER_GENERATION_TEMPLATE = """
You are an expert Neo4j Developer translating user questions into Cypher to answer questions about movies and provide recommendations.
Convert the user's question based on the schema.

Schema: {schema}
Question: {question}
"""
# end::template[]

# tag::prompt[]
cypher_generation_prompt = PromptTemplate(
    template=CYPHER_GENERATION_TEMPLATE,
    input_variables=["schema", "question"],
)
# end::prompt[]

# tag::cypher-chain[]
cypher_chain = GraphCypherQAChain.from_llm(
    llm,
    graph=graph,
    cypher_prompt=cypher_generation_prompt,
    verbose=True,
    allow_dangerous_requests=True
)
# end::cypher-chain[]

# tag::invoke[]
result = cypher_chain.invoke({"query": "What is the plot of the movie Toy Story?"})

print(result)
# end::invoke[]