import os
from langchain_neo4j import Neo4jGraph

graph = Neo4jGraph(
    url=os.getenv("NEO4J_URI"),
    username=os.getenv("NEO4J_USERNAME"),
    password=os.getenv("NEO4J_PASSWORD")
)

result = graph.query("""
MATCH (m:Movie{title: 'Toy Story'}) 
RETURN m.title, m.plot, m.poster
""")

print(result)